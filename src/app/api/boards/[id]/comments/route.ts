import { NextRequest, NextResponse } from "next/server";
import notion, { databaseIds, getTextProperty } from "@/lib/notion";
import { verifyToken } from "@/lib/auth";
import { getAdminLevel } from "@/lib/types";
import { mockBoardComments } from "@/lib/mock-data";
import type { BoardComment, User } from "@/lib/types";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.boardComments;

function getCurrentUser(request: NextRequest): User | null {
  const token = request.cookies.get("hwaran-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (USE_MOCK) {
    return NextResponse.json({ comments: mockBoardComments.filter((c) => c.postId === id) });
  }

  try {
    const res = await notion.databases.query({
      database_id: databaseIds.boardComments,
      filter: { property: "게시글ID", rich_text: { equals: id } },
      sorts: [{ property: "작성일", direction: "ascending" }],
    });
    const comments: BoardComment[] = res.results.map((row) => {
      const page = row as Record<string, unknown>;
      return {
        id: page.id as string,
        postId: getTextProperty(page, "게시글ID"),
        content: getTextProperty(page, "내용"),
        authorId: getTextProperty(page, "작성자ID"),
        authorName: getTextProperty(page, "작성자명"),
        authorRole: (getTextProperty(page, "작성자역할") as BoardComment["authorRole"]) || undefined,
        createdAt: getTextProperty(page, "작성일"),
        isAdminComment: getTextProperty(page, "관리자댓글여부") === "true",
      };
    });
    return NextResponse.json({ comments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const content = (body.content || "").trim();
  if (!content) return NextResponse.json({ error: "댓글 내용을 입력해주세요." }, { status: 400 });

  const newComment: BoardComment = {
    id: `bc-${Date.now()}`,
    postId: id,
    content,
    authorId: user.id,
    authorName: user.name,
    authorRole: user.role,
    createdAt: new Date().toISOString().split("T")[0],
    isAdminComment: getAdminLevel(user.role) > 0,
  };

  if (USE_MOCK) {
    mockBoardComments.push(newComment);
    return NextResponse.json({ comment: newComment }, { status: 201 });
  }

  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseIds.boardComments },
      properties: {
        게시글ID: { rich_text: [{ text: { content: id } }] },
        내용: { rich_text: [{ text: { content } }] },
        작성자ID: { rich_text: [{ text: { content: user.id } }] },
        작성자명: { rich_text: [{ text: { content: user.name } }] },
        작성자역할: { rich_text: [{ text: { content: user.role } }] },
        관리자댓글여부: { checkbox: getAdminLevel(user.role) > 0 },
        작성일: { date: { start: new Date().toISOString().split("T")[0] } },
      },
    });
    return NextResponse.json({ id: response.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "댓글 작성에 실패했습니다." }, { status: 500 });
  }
}
