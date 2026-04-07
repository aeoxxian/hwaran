import { NextResponse } from "next/server";
import { getBanners } from "@/lib/data";

export async function GET() {
  const banners = await getBanners();
  return NextResponse.json(banners);
}
