import { NextResponse } from "next/server";
import notion, { databaseIds, getTextProperty, getFilesProperty } from "@/lib/notion";
import { mockClubs, mockClubMembers } from "@/lib/mock-data";
import type { Club, ClubMember } from "@/lib/types";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.clubs;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeMembers = searchParams.get("members") === "true";
  const clubId = searchParams.get("id");

  if (USE_MOCK) {
    if (clubId) {
      const club = mockClubs.find((c) => c.id === clubId);
      const members = includeMembers ? mockClubMembers.filter((m) => m.clubId === clubId) : [];
      return NextResponse.json({ club, members });
    }
    return NextResponse.json(mockClubs);
  }

  try {
    if (clubId) {
      const page = await notion.pages.retrieve({ page_id: clubId });
      const p = page as Record<string, unknown>;
      const club: Club = {
        id: p.id as string,
        name: getTextProperty(p, "이름"),
        description: getTextProperty(p, "소개"),
        logo: getFilesProperty(p, "로고")[0],
        bannerImage: getFilesProperty(p, "배너이미지")[0],
        instagramUrl: getTextProperty(p, "인스타그램"),
        category: getTextProperty(p, "분류"),
        memberCount: parseInt(getTextProperty(p, "회원수")) || 0,
      };

      let members: ClubMember[] = [];
      if (includeMembers && databaseIds.clubMembers) {
        const membersRes = await notion.databases.query({
          database_id: databaseIds.clubMembers,
          filter: { property: "동아리ID", rich_text: { equals: clubId } },
        });
        members = membersRes.results.map((mp) => {
          const m = mp as Record<string, unknown>;
          return {
            id: m.id as string,
            name: getTextProperty(m, "이름"),
            role: getTextProperty(m, "역할") as ClubMember["role"],
            introduction: getTextProperty(m, "소개"),
            profileImage: getFilesProperty(m, "프로필사진")[0],
            clubId,
          };
        });
      }

      return NextResponse.json({ club, members });
    }

    const response = await notion.databases.query({
      database_id: databaseIds.clubs,
    });

    const clubs: Club[] = response.results.map((page) => {
      const p = page as Record<string, unknown>;
      return {
        id: p.id as string,
        name: getTextProperty(p, "이름"),
        description: getTextProperty(p, "소개"),
        logo: getFilesProperty(p, "로고")[0],
        bannerImage: getFilesProperty(p, "배너이미지")[0],
        instagramUrl: getTextProperty(p, "인스타그램"),
        category: getTextProperty(p, "분류"),
        memberCount: parseInt(getTextProperty(p, "회원수")) || 0,
      };
    });

    return NextResponse.json(clubs);
  } catch (error) {
    console.error("Failed to fetch clubs:", error);
    return NextResponse.json(clubId ? { club: null, members: [] } : mockClubs);
  }
}
