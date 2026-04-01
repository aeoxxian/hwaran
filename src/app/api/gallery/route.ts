import { NextResponse } from "next/server";
import notion, { databaseIds, getTextProperty, getFilesProperty } from "@/lib/notion";
import { mockGalleryAlbums } from "@/lib/mock-data";
import type { GalleryAlbum } from "@/lib/types";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.gallery;

export async function GET() {
  if (USE_MOCK) {
    return NextResponse.json(mockGalleryAlbums);
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseIds.gallery,
      sorts: [{ property: "날짜", direction: "descending" }],
    });

    const albums: GalleryAlbum[] = response.results.map((page) => {
      const p = page as Record<string, unknown>;
      const images = getFilesProperty(p, "이미지");
      return {
        id: p.id as string,
        title: getTextProperty(p, "행사명"),
        date: getTextProperty(p, "날짜"),
        description: getTextProperty(p, "설명"),
        coverImage: images[0] || "/images/gallery-placeholder.png",
        images,
        clubId: getTextProperty(p, "동아리ID") || undefined,
        clubName: getTextProperty(p, "동아리명") || undefined,
      };
    });

    return NextResponse.json(albums);
  } catch (error) {
    console.error("Failed to fetch gallery:", error);
    return NextResponse.json(mockGalleryAlbums);
  }
}
