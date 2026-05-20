import { getEvents } from "@/lib/data";
import EventManager from "@/components/admin/content/EventManager";

export const metadata = { title: "캘린더 관리" };
export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await getEvents();
  return <EventManager events={events} />;
}
