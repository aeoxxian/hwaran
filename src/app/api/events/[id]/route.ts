import { NextRequest, NextResponse } from "next/server";
import { updateEvent, deleteEvent } from "@/lib/data";
import { guard } from "@/lib/api-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = guard(request, { minAdminLevel: 1 });
  if (!g.ok) return g.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const patch: Record<string, unknown> = {};
    for (const key of ["title", "startDate", "endDate", "clubId", "clubName", "location", "description", "color"]) {
      if (body[key] !== undefined) patch[key] = body[key];
    }

    const event = await updateEvent(id, patch);
    if (!event) return NextResponse.json({ error: "일정을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json(event);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "일정 수정에 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = guard(request, { minAdminLevel: 1 });
  if (!g.ok) return g.response;

  try {
    const { id } = await params;
    const ok = await deleteEvent(id);
    if (!ok) return NextResponse.json({ error: "일정을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "일정 삭제에 실패했습니다." }, { status: 500 });
  }
}
