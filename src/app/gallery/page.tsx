import { getGalleryAlbums } from "@/lib/data";
import type { Metadata } from "next";
import GalleryClient from "@/components/gallery/GalleryClient";

export const metadata: Metadata = { title: "갤러리" };

export default async function GalleryPage() {
  const albums = await getGalleryAlbums();
  return <GalleryClient albums={albums} />;
}
