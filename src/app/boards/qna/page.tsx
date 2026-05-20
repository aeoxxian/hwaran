import BoardList from "@/components/boards/BoardList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "문의 게시판" };

export default function QnAPage() {
  return <BoardList category="qna" />;
}
