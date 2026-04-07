import { NextResponse } from "next/server";
import { getGalleryAlbums } from "@/lib/data";

export async function GET() {
  const albums = await getGalleryAlbums();
  return NextResponse.json(albums);
}
