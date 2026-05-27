import { requireAdminLevel } from "@/lib/server-auth";
import Client from "./Client";

export default async function AdminBoardsPage() {
  await requireAdminLevel(2);
  return <Client />;
}
