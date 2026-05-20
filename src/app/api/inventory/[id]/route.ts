import { NextRequest, NextResponse } from "next/server";
import { updateInventoryItem, deleteInventoryItem } from "@/lib/data";
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
    if (body.name !== undefined) patch.name = body.name;
    if (body.quantity !== undefined) patch.quantity = Number(body.quantity);
    if (body.status !== undefined) patch.status = body.status;
    if (body.location !== undefined) patch.location = body.location;
    if (body.note !== undefined) patch.note = body.note;

    const item = await updateInventoryItem(id, patch);
    if (!item) return NextResponse.json({ error: "물품을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json(item);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "물품 수정에 실패했습니다." }, { status: 500 });
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
    const ok = await deleteInventoryItem(id);
    if (!ok) return NextResponse.json({ error: "물품을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "물품 삭제에 실패했습니다." }, { status: 500 });
  }
}
