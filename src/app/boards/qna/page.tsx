import BoardList from "@/components/boards/BoardList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "?? ???" };

export default function QnAPage() {
  return <BoardList category="qna" />;
}