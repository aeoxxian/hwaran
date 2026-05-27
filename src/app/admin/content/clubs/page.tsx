import { getClubs } from "@/lib/data";
import { clubCategories } from "@/lib/mock-data";
import ClubManager from "@/components/admin/content/ClubManager";
import { requireAdminLevel } from "@/lib/server-auth";

export const metadata = { title: "동아리 관리" };
export const dynamic = "force-dynamic";

export default async function AdminClubsPage() {
  await requireAdminLevel(2);
  const clubs = await getClubs();
  return <ClubManager clubs={clubs} categories={[...clubCategories]} />;
}
