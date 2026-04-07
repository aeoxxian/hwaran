import { getEvents } from "@/lib/data";
import type { Metadata } from "next";
import CalendarClient from "@/components/calendar/CalendarClient";

export const metadata: Metadata = { title: "캘린더" };

export default async function CalendarPage() {
  const events = await getEvents();
  return <CalendarClient events={events} />;
}
