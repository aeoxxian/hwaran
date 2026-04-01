import { NextRequest, NextResponse } from "next/server";
import notion, { databaseIds, getTextProperty, getFilesProperty } from "@/lib/notion";
import { verifyToken } from "@/lib/auth";
import { mockBoardPosts } from "@/lib/mock-data";
import type { BoardPost, User } from "@/lib/types";

type BoardCategory = BoardPost["category"];

const VALID_CATEGORIES: BoardCategory[] = ["qna", "complaints", "lost-found", "promotions"];
const USE_MOCK = !process.env.NOTION_API_KEY;

function getDbIdForCategory(category: string): string {
  switch (category) {
    case "qna":
      return databaseIds.qna;
    case "complaints":
      return databaseIds.complaints;
    case "lost-found":
      return databaseIds.lostFound;
    case "promotions":
      return databaseIds.promotions;
    default:
      return "";
  }
}

function getCurrentUser(request: NextRequest): User | null {
  const token = request.cookies.get("hwaran-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

function mapNotionPageToBoardPost(page: Record<string, unknown>, category: BoardCategory): BoardPost {
  const author = getTextProperty(page, "작성자");
  return {
    id: page.id as string,
    title: getTextProperty(page, "제목"),
    content: getTextProperty(page, "내용") || getTextProperty(page, "설명"),
    authorId: getTextProperty(page, "작성자ID") || undefined,
    author: author || "익명",
    createdAt: getTextProperty(page, "작성일"),
    updatedAt: getTextProperty(page, "수정일") || undefined,
    category,
    status: (getTextProperty(page, "상태") || "대기") as BoardPost["status"],
    visibility: (getTextProperty(page, "공개범위") as BoardPost["visibility"]) || "public",
    approvalStatus: (getTextProperty(page, "승인상태") as BoardPost["approvalStatus"]) || "approved",
    isAnonymous: getTextProperty(page, "익명여부") === "true",
    images: getFilesProperty(page, "이미지"),
    attachments: getFilesProperty(page, "첨부파일"),
    reply: getTextProperty(page, "답변") || undefined,
    replyDate: getTextProperty(page, "답변일") || undefined,
    clubId: getTextProperty(page, "동아리ID") || undefined,
    clubName: getTextProperty(page, "동아리명") || undefined,
    location: getTextProperty(page, "장소") || undefined,
  };
}

function isBoardCategory(value: string | null): value is BoardCategory {
  return !!value && VALID_CATEGORIES.includes(value as BoardCategory);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("category");
  const category: BoardCategory = isBoardCategory(categoryParam) ? categoryParam : "qna";
  const search = (searchParams.get("search") || "").toLowerCase();
  const status = searchParams.get("status") || "";
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Math.min(Number(searchParams.get("pageSize") || "20"), 100);

  if (USE_MOCK || !getDbIdForCategory(category)) {
    let posts = mockBoardPosts.filter((p) => p.category === category);
    if (status) posts = posts.filter((p) => p.status === status);
    if (search) {
      posts = posts.filter(
        (p) => p.title.toLowerCase().includes(search) || p.content.toLowerCase().includes(search)
      );
    }
    const offset = (page - 1) * pageSize;
    return NextResponse.json({ posts: posts.slice(offset, offset + pageSize), total: posts.length, page, pageSize });
  }

  try {
    const response = await notion.databases.query({
      database_id: getDbIdForCategory(category),
      sorts: [{ property: "작성일", direction: "descending" }],
      page_size: 100,
    });

    let posts = response.results.map((result) =>
      mapNotionPageToBoardPost(result as Record<string, unknown>, category)
    );
    if (status) posts = posts.filter((p) => p.status === status);
    if (search) {
      posts = posts.filter(
        (p) => p.title.toLowerCase().includes(search) || p.content.toLowerCase().includes(search)
      );
    }

    const offset = (page - 1) * pageSize;
    return NextResponse.json({ posts: posts.slice(offset, offset + pageSize), total: posts.length, page, pageSize });
  } catch (error) {
    console.error("Failed to fetch board posts:", error);
    const posts = mockBoardPosts.filter((p) => p.category === category);
    return NextResponse.json({ posts, total: posts.length, page: 1, pageSize: posts.length });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const category = body.category as BoardCategory;
  if (!category || !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "유효하지 않은 카테고리입니다." }, { status: 400 });
  }

  if (!body.title || !body.content) {
    return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
  }

  const user = getCurrentUser(request);
  const authorName = body.isAnonymous ? "익명" : user?.name || body.author || "익명";
  const authorId = user?.id || "";
  const today = new Date().toISOString().split("T")[0];

  if (USE_MOCK || !getDbIdForCategory(category)) {
    const newPost: BoardPost = {
      id: `post-${Date.now()}`,
      title: body.title,
      content: body.content,
      authorId,
      author: authorName,
      createdAt: today,
      updatedAt: today,
      category,
      status: category === "lost-found" ? "미해결" : "대기",
      isAnonymous: Boolean(body.isAnonymous),
      clubId: body.clubId || undefined,
      clubName: body.clubName || undefined,
      location: body.location || undefined,
      attachments: body.attachments || [],
      images: body.images || [],
      approvalStatus: category === "promotions" ? "pending" : "approved",
      visibility: "public",
    };
    mockBoardPosts.unshift(newPost);
    return NextResponse.json({ post: newPost }, { status: 201 });
  }

  try {
    const properties: Record<string, unknown> = {
      제목: { title: [{ text: { content: body.title } }] },
      작성일: { date: { start: today } },
      수정일: { date: { start: today } },
      작성자ID: { rich_text: [{ text: { content: authorId } }] },
      작성자: { rich_text: [{ text: { content: authorName } }] },
      공개범위: { select: { name: body.visibility || "public" } },
      승인상태: { select: { name: category === "promotions" ? "pending" : "approved" } },
    };

    if (category === "qna" || category === "complaints" || category === "promotions") {
      properties["내용"] = { rich_text: [{ text: { content: body.content } }] };
      properties["상태"] = { select: { name: "대기" } };
    }
    if (category === "complaints") {
      properties["익명여부"] = { checkbox: Boolean(body.isAnonymous) };
    }
    if (category === "lost-found") {
      properties["설명"] = { rich_text: [{ text: { content: body.content } }] };
      properties["장소"] = { rich_text: [{ text: { content: body.location || "" } }] };
      properties["상태"] = { select: { name: "미해결" } };
    }
    if (category === "promotions") {
      properties["동아리ID"] = { rich_text: [{ text: { content: body.clubId || "" } }] };
      properties["동아리명"] = { rich_text: [{ text: { content: body.clubName || "" } }] };
    }

    if (Array.isArray(body.attachments) && body.attachments.length > 0) {
      properties["첨부파일"] = {
        files: body.attachments.map((url: string, index: number) => ({
          name: `첨부파일-${index + 1}`,
          type: "external",
          external: { url },
        })),
      };
    }

    const response = await notion.pages.create({
      parent: { database_id: getDbIdForCategory(category) },
      properties: properties as Parameters<typeof notion.pages.create>[0]["properties"],
    });

    return NextResponse.json({ id: response.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create board post:", error);
    return NextResponse.json({ error: "게시글 작성에 실패했습니다." }, { status: 500 });
  }
}
