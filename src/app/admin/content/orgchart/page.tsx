import { getOrgChartMembers } from "@/lib/data";
import OrgChartManager from "@/components/admin/content/OrgChartManager";
import { requireAdminLevel } from "@/lib/server-auth";

export const metadata = { title: "조직도 관리" };
export const dynamic = "force-dynamic";

export default async function AdminOrgChartPage() {
  await requireAdminLevel(2);
  const members = await getOrgChartMembers();
  return <OrgChartManager members={members} />;
}
