import { getGalleryAlbums } from "@/lib/data";
import GalleryManager from "@/components/admin/content/GalleryManager";

export const metadata = { title: "갤러리 관리" };
export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const albums = await getGalleryAlbums();
  return <GalleryManager albums={albums} />;
}
