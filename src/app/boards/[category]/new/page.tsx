import BoardEditor from "@/components/boards/BoardEditor";
import type { BoardPost } from "@/lib/types";
import { notFound } from "next/navigation";

const VALID_CATEGORIES: BoardPost["category"][] = ["qna", "complaints", "lost-found", "promotions"];

export default async function NewBoardPostPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!VALID_CATEGORIES.includes(category as BoardPost["category"])) {
    notFound();
  }
  return <BoardEditor category={category as BoardPost["category"]} />;
}
