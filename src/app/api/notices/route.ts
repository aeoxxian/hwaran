import { NextRequest, NextResponse } from "next/server";
import { getNotices } from "@/lib/data";
import { verifyToken } from "@/lib/auth";
import { getAdminLevel } from "@/lib/types";
import notion, { databaseIds } from "@/lib/notion";
import { mockNotices } from "@/lib/mock-data";
import type { Notice } from "@/lib/types";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.notices;

export async function GET() {
  const notices = await getNotices();
  return NextResponse.json(notices);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("hwaran-token")?.value;
  const user = token ? verifyToken(token) : null;
  if (!user || getAdminLevel(user.role) < 2) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json();

  if (USE_MOCK) {
    const newNotice: Notice = {
      id: `notice-${Date.now()}`,
      title: body.title,
      content: body.content,
      author: user.name,
      createdAt: new Date().toISOString().split("T")[0],
      isPinned: body.isPinned || false,
    };
    mockNotices.unshift(newNotice);
    return NextResponse.json({ id: newNotice.id }, { status: 201 });
  }

  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseIds.notices },
      properties: {
        제목: { title: [{ text: { content: body.title } }] },
        내용: { rich_text: [{ text: { content: body.content } }] },
        작성자: { rich_text: [{ text: { content: user.name } }] },
        작성일: { date: { start: new Date().toISOString().split("T")[0] } },
        중요여부: { checkbox: body.isPinned || false },
      },
    });
    return NextResponse.json({ id: response.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create notice:", error);
    return NextResponse.json({ error: "공지 작성에 실패했습니다." }, { status: 500 });
  }
}
