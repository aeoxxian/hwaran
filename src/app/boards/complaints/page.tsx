import BoardList from "@/components/boards/BoardList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "민원 게시판" };

export default function ComplaintsPage() {
  return <BoardList category="complaints" />;
}
