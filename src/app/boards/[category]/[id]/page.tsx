import BoardDetail from "@/components/boards/BoardDetail";
import { getBoardPostById } from "@/lib/data";
import type { BoardPost } from "@/lib/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const VALID_CATEGORIES: BoardPost["category"][] = ["qna", "complaints", "lost-found", "promotions"];

export async function generateMetadata({ params }: { params: Promise<{ category: string; id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getBoardPostById(id);
  if (!post) {
    return { title: "게시글" };
  }
  return { title: post.title };
}

export default async function BoardDetailPage({ params }: { params: Promise<{ category: string; id: string }> }) {
  const { category, id } = await params;
  if (!VALID_CATEGORIES.includes(category as BoardPost["category"])) {
    notFound();
  }
  return <BoardDetail category={category as BoardPost["category"]} id={id} />;
}
