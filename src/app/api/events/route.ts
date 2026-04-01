import { NextRequest, NextResponse } from "next/server";
import notion, { databaseIds, getTextProperty } from "@/lib/notion";
import { mockEvents } from "@/lib/mock-data";
import type { CalendarEvent } from "@/lib/types";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.events;

export async function GET() {
  if (USE_MOCK) {
    return NextResponse.json(mockEvents);
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseIds.events,
      sorts: [{ property: "시작일", direction: "ascending" }],
    });

    const events: CalendarEvent[] = response.results.map((page) => {
      const p = page as Record<string, unknown>;
      return {
        id: p.id as string,
        title: getTextProperty(p, "제목"),
        startDate: getTextProperty(p, "시작일"),
        endDate: getTextProperty(p, "종료일") || getTextProperty(p, "시작일"),
        clubId: getTextProperty(p, "동아리ID") || undefined,
        clubName: getTextProperty(p, "동아리명") || undefined,
        location: getTextProperty(p, "장소") || undefined,
        description: getTextProperty(p, "설명") || undefined,
        color: getTextProperty(p, "색상") || undefined,
      };
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(mockEvents);
  }
}

export async function POST(request: NextRequest) {
  if (USE_MOCK) {
    return NextResponse.json({ error: "Notion API가 연결되지 않았습니다." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const response = await notion.pages.create({
      parent: { database_id: databaseIds.events },
      properties: {
        제목: { title: [{ text: { content: body.title } }] },
        시작일: { date: { start: body.startDate } },
        종료일: { date: { start: body.endDate || body.startDate } },
        동아리ID: { rich_text: [{ text: { content: body.clubId || "" } }] },
        동아리명: { rich_text: [{ text: { content: body.clubName || "" } }] },
        장소: { rich_text: [{ text: { content: body.location || "" } }] },
        설명: { rich_text: [{ text: { content: body.description || "" } }] },
        색상: { rich_text: [{ text: { content: body.color || "#E05252" } }] },
      },
    });
    return NextResponse.json({ id: response.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json({ error: "일정 등록에 실패했습니다." }, { status: 500 });
  }
}
