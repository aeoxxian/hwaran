import BoardEditor from "@/components/boards/BoardEditor";
import type { BoardPost } from "@/lib/types";
import { notFound } from "next/navigation";

const VALID_CATEGORIES: BoardPost["category"][] = ["qna", "complaints", "lost-found", "promotions"];

export default async function EditBoardPostPage({ params }: { params: Promise<{ category: string; id: string }> }) {
  const { category, id } = await params;
  if (!VALID_CATEGORIES.includes(category as BoardPost["category"])) {
    notFound();
  }
  return <BoardEditor category={category as BoardPost["category"]} postId={id} />;
}
