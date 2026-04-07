import { NextResponse } from "next/server";
import { getClubs, getClubById } from "@/lib/data";

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
