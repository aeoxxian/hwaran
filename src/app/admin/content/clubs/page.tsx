import { getClubs } from "@/lib/data";
import { clubCategories } from "@/lib/mock-data";
import ClubManager from "@/components/admin/content/ClubManager";

export const metadata = { title: "동아리 관리" };
export const dynamic = "force-dynamic";

export default async function AdminClubsPage() {
  const clubs = await getClubs();
  return <ClubManager clubs={clubs} categories={[...clubCategories]} />;
}
