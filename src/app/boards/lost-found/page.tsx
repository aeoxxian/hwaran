import BoardList from "@/components/boards/BoardList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "분실물 게시판" };

export default function LostFoundPage() {
  return <BoardList category="lost-found" />;
}
