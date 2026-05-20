import { NextRequest, NextResponse } from "next/server";
import { updateOrgChartMember, deleteOrgChartMember } from "@/lib/data";
import { guard } from "@/lib/api-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = guard(request, { minAdminLevel: 2 });
  if (!g.ok) return g.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const patch: Record<string, unknown> = {};
    for (const key of ["name", "title", "department", "team"]) {
      if (body[key] !== undefined) patch[key] = body[key];
    }
    if (body.order !== undefined) patch.order = Number(body.order);

    const member = await updateOrgChartMember(id, patch);
    if (!member) return NextResponse.json({ error: "구성원을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json(member);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "조직도 구성원 수정에 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = guard(request, { minAdminLevel: 2 });
  if (!g.ok) return g.response;

  try {
    const { id } = await params;
    const ok = await deleteOrgChartMember(id);
    if (!ok) return NextResponse.json({ error: "구성원을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "조직도 구성원 삭제에 실패했습니다." }, { status: 500 });
  }
}
