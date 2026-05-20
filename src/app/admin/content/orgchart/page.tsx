import { getOrgChartMembers } from "@/lib/data";
import OrgChartManager from "@/components/admin/content/OrgChartManager";

export const metadata = { title: "조직도 관리" };
export const dynamic = "force-dynamic";

export default async function AdminOrgChartPage() {
  const members = await getOrgChartMembers();
  return <OrgChartManager members={members} />;
}
