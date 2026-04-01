import BoardDetail from "@/components/boards/BoardDetail";
import type { BoardPost } from "@/lib/types";
import { notFound } from "next/navigation";

const VALID_CATEGORIES: BoardPost["category"][] = ["qna", "complaints", "lost-found", "promotions"];

export default async function BoardDetailPage({ params }: { params: Promise<{ category: string; id: string }> }) {
  const { category, id } = await params;
  if (!VALID_CATEGORIES.includes(category as BoardPost["category"])) {
    notFound();
  }
  return <BoardDetail category={category as BoardPost["category"]} id={id} />;
}
