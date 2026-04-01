import { NextResponse } from "next/server";
import notion, { databaseIds, getTextProperty, getFilesProperty } from "@/lib/notion";
import { mockBanners } from "@/lib/mock-data";
import type { Banner } from "@/lib/types";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.banners;

export async function GET() {
  if (USE_MOCK) {
    return NextResponse.json(mockBanners);
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseIds.banners,
      filter: { property: "활성여부", checkbox: { equals: true } },
    });

    const banners: Banner[] = response.results.map((page) => {
      const p = page as Record<string, unknown>;
      return {
        id: p.id as string,
        clubId: getTextProperty(p, "동아리ID"),
        clubName: getTextProperty(p, "동아리명"),
        imageUrl: getFilesProperty(p, "이미지")[0] || "/images/banner-placeholder.png",
        linkUrl: getTextProperty(p, "링크") || undefined,
        isActive: true,
      };
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error("Failed to fetch banners:", error);
    return NextResponse.json(mockBanners);
  }
}
