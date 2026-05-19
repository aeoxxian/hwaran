import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/lib/api-auth";
import { getApplications } from "@/lib/data";

export async function GET(request: NextRequest) {
  const g = guard(request, { minAdminLevel: 2 });
  if (!g.ok) return g.response;

  try {
    const applications = await getApplications();
    return NextResponse.json({ applications });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서류 목록 조회 실패" }, { status: 500 });
  }
}
