import { requireAdminLevel } from "@/lib/server-auth";
import Client from "./Client";

export const metadata = { title: "공지 작성" };

export default async function AdminNoticeNewPage() {
  await requireAdminLevel(2);
  return <Client />;
}
