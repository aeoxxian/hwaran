import BoardList from "@/components/boards/BoardList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "?? ???" };

export default function ComplaintsPage() {
  return <BoardList category="complaints" />;
}