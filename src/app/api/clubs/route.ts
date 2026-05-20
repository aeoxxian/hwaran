import { NextRequest, NextResponse } from "next/server";
import { getClubs, getClubById, createClub } from "@/lib/data";
import { guard } from "@/lib/api-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("id");
  const includeMembers = searchParams.get("members") === "true";

  if (clubId) {
    const result = await getClubById(clubId);
    if (!includeMembers) {
      return NextResponse.json({ club: result.club, members: [] });
    }
    return NextResponse.json(result);
  }

  const clubs = await getClubs();
  return NextResponse.json(clubs);
}

export async function POST(request: NextRequest) {
  const g = guard(request, { minAdminLevel: 2 });
  if (!g.ok) return g.response;

  try {
    const body = await request.json();
    const { name, description, category, instagramUrl, memberCount, logo, bannerImage } = body;
    if (!name || !description || !category) {
      return NextResponse.json({ error: "이름/소개/분류는 필수입니다." }, { status: 400 });
    }
    const club = await createClub({
      name,
      description,
      category,
      instagramUrl,
      memberCount: memberCount !== undefined ? Number(memberCount) : undefined,
      logo,
      bannerImage,
    });
    return NextResponse.json(club, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "동아리 등록에 실패했습니다." }, { status: 500 });
  }
}
