import { getInventory } from "@/lib/data";
import InventoryManager from "@/components/admin/content/InventoryManager";

export const metadata = { title: "물품 관리" };
export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const items = await getInventory();
  return <InventoryManager items={items} />;
}
