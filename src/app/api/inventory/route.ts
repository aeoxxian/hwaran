import { NextRequest, NextResponse } from "next/server";
import { getInventory, createInventoryItem } from "@/lib/data";
import { guard } from "@/lib/api-auth";

export async function GET() {
  const inventory = await getInventory();
  return NextResponse.json(inventory);
}

export async function POST(request: NextRequest) {
  const g = guard(request, { minAdminLevel: 1 });
  if (!g.ok) return g.response;

  try {
    const body = await request.json();
    const { name, quantity, status, location, note } = body;

    if (!name || quantity === undefined || !status || !location) {
      return NextResponse.json({ error: "이름/수량/상태/보관위치는 필수입니다." }, { status: 400 });
    }

    const item = await createInventoryItem({ name, quantity: Number(quantity), status, location, note });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "물품 등록에 실패했습니다." }, { status: 500 });
  }
}
