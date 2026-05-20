import { NextRequest, NextResponse } from "next/server";
import { getGalleryAlbums, createGalleryAlbum } from "@/lib/data";
import { guard } from "@/lib/api-auth";

export async function GET() {
  const albums = await getGalleryAlbums();
  return NextResponse.json(albums);
}

export async function POST(request: NextRequest) {
  const g = guard(request, { minAdminLevel: 1 });
  if (!g.ok) return g.response;

  try {
    const body = await request.json();
    const { title, date, description, images, clubId, clubName } = body;

    if (!title || !date || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "제목/날짜/이미지(1장 이상)는 필수입니다." }, { status: 400 });
    }

    const album = await createGalleryAlbum({
      title,
      date,
      description: description || "",
      images,
      clubId,
      clubName,
    });
    return NextResponse.json(album, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "앨범 등록에 실패했습니다." }, { status: 500 });
  }
}
