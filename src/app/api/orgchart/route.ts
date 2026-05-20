import { NextRequest, NextResponse } from "next/server";
import { getOrgChartMembers, createOrgChartMember } from "@/lib/data";
import { guard } from "@/lib/api-auth";

export async function GET() {
  const members = await getOrgChartMembers();
  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  const g = guard(request, { minAdminLevel: 2 });
  if (!g.ok) return g.response;

  try {
    const body = await request.json();
    const { name, title, department, team, order } = body;
    if (!name || !title || !department) {
      return NextResponse.json({ error: "이름/직책/부서는 필수입니다." }, { status: 400 });
    }
    const member = await createOrgChartMember({
      name,
      title,
      department,
      team: team || undefined,
      order: order !== undefined ? Number(order) : 999,
    });
    return NextResponse.json(member, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "조직도 구성원 등록에 실패했습니다." }, { status: 500 });
  }
}
