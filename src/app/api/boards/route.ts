import { NextRequest, NextResponse } from "next/server";
import notion, { databaseIds, getTextProperty, getFilesProperty } from "@/lib/notion";
import { mockBoardPosts } from "@/lib/mock-data";
import type { BoardPost } from "@/lib/types";

function getDbIdForCategory(category: string): string {
  switch (category) {
    case "qna": return databaseIds.qna;
    case "complaints": return databaseIds.complaints;
    case "lost-found": return databaseIds.lostFound;
    case "promotions": return databaseIds.promotions;
    default: return "";
  }
}

const USE_MOCK = !process.env.NOTION_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "qna";

  if (USE_MOCK) {
    const posts = mockBoardPosts.filter((p) => p.category === category);
    return NextResponse.json(posts);
  }

  const dbId = getDbIdForCategory(category);
  if (!dbId) {
    return NextResponse.json(mockBoardPosts.filter((p) => p.category === category));
  }

  try {
    const response = await notion.databases.query({
      database_id: dbId,
      sorts: [{ property: "작성일", direction: "descending" }],
    });

    const posts: BoardPost[] = response.results.map((page) => {
      const p = page as Record<string, unknown>;
      return {
        id: p.id as string,
        title: getTextProperty(p, "제목"),
        content: getTextProperty(p, "내용") || getTextProperty(p, "설명"),
        author: getTextProperty(p, "작성자"),
        createdAt: getTextProperty(p, "작성일"),
        category: category as BoardPost["category"],
        status: (getTextProperty(p, "상태") || "대기") as BoardPost["status"],
        isAnonymous: getTextProperty(p, "익명여부") === "true",
        images: getFilesProperty(p, "이미지"),
        reply: getTextProperty(p, "답변") || undefined,
        replyDate: getTextProperty(p, "답변일") || undefined,
        clubId: getTextProperty(p, "동아리ID") || undefined,
        clubName: getTextProperty(p, "동아리명") || undefined,
      };
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Failed to fetch board posts:", error);
    return NextResponse.json(mockBoardPosts.filter((p) => p.category === category));
  }
}

export async function POST(request: NextRequest) {
  if (USE_MOCK) {
    return NextResponse.json({ error: "Notion API가 연결되지 않았습니다." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const category = body.category || "qna";
    const dbId = getDbIdForCategory(category);
    if (!dbId) {
      return NextResponse.json({ error: "유효하지 않은 카테고리입니다." }, { status: 400 });
    }

    const properties: Record<string, unknown> = {
      제목: { title: [{ text: { content: body.title } }] },
      작성일: { date: { start: new Date().toISOString().split("T")[0] } },
    };

    if (category === "qna" || category === "complaints") {
      properties["내용"] = { rich_text: [{ text: { content: body.content } }] };
      properties["작성자"] = { rich_text: [{ text: { content: body.author || "익명" } }] };
      properties["상태"] = { select: { name: "대기" } };
    }
    if (category === "complaints") {
      properties["익명여부"] = { checkbox: body.isAnonymous || false };
    }
    if (category === "lost-found") {
      properties["설명"] = { rich_text: [{ text: { content: body.content } }] };
      properties["장소"] = { rich_text: [{ text: { content: body.location || "" } }] };
      properties["상태"] = { select: { name: "미해결" } };
      properties["작성자"] = { rich_text: [{ text: { content: body.author } }] };
    }
    if (category === "promotions") {
      properties["내용"] = { rich_text: [{ text: { content: body.content } }] };
      properties["동아리ID"] = { rich_text: [{ text: { content: body.clubId || "" } }] };
      properties["동아리명"] = { rich_text: [{ text: { content: body.clubName || "" } }] };
      properties["작성자"] = { rich_text: [{ text: { content: body.author } }] };
    }

    const response = await notion.pages.create({
      parent: { database_id: dbId },
      properties: properties as Parameters<typeof notion.pages.create>[0]["properties"],
    });

    return NextResponse.json({ id: response.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create board post:", error);
    return NextResponse.json({ error: "게시글 작성에 실패했습니다." }, { status: 500 });
  }
}
