import { NextRequest, NextResponse } from "next/server";
import { updateClub, deleteClub } from "@/lib/data";
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
    for (const key of ["name", "description", "category", "instagramUrl", "logo", "bannerImage"]) {
      if (body[key] !== undefined) patch[key] = body[key];
    }
    if (body.memberCount !== undefined) patch.memberCount = Number(body.memberCount);

    const club = await updateClub(id, patch);
    if (!club) return NextResponse.json({ error: "동아리를 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json(club);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "동아리 수정에 실패했습니다." }, { status: 500 });
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
    const ok = await deleteClub(id);
    if (!ok) return NextResponse.json({ error: "동아리를 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "동아리 삭제에 실패했습니다." }, { status: 500 });
  }
}
