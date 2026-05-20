import { NextRequest, NextResponse } from "next/server";
import { getEvents, createEvent } from "@/lib/data";
import { guard } from "@/lib/api-auth";

export async function GET() {
  const events = await getEvents();
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const g = guard(request, { minAdminLevel: 1 });
  if (!g.ok) return g.response;

  try {
    const body = await request.json();
    if (!body.title || !body.startDate) {
      return NextResponse.json({ error: "제목과 시작일은 필수입니다." }, { status: 400 });
    }

    const event = await createEvent({
      title: body.title,
      startDate: body.startDate,
      endDate: body.endDate || undefined,
      clubId: body.clubId || undefined,
      clubName: body.clubName || undefined,
      location: body.location || undefined,
      description: body.description || undefined,
      color: body.color || "#E05252",
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json({ error: "일정 등록에 실패했습니다." }, { status: 500 });
  }
}
