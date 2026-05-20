import { NextRequest, NextResponse } from "next/server";
import { deleteDocument } from "@/lib/data";
import { guard } from "@/lib/api-auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = guard(request, { minAdminLevel: 1 });
  if (!g.ok) return g.response;

  try {
    const { id } = await params;
    const ok = await deleteDocument(id);
    if (!ok) return NextResponse.json({ error: "자료를 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "자료 삭제에 실패했습니다." }, { status: 500 });
  }
}
