import Link from "next/link";
import { mockBoardPosts } from "@/lib/mock-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "분실물 게시판" };

export default function LostFoundPage() {
  const posts = mockBoardPosts.filter((p) => p.category === "lost-found");

  return (
    <div className="container-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark">분실물 게시판</h1>
          <p className="section-subtitle">분실물 및 습득물을 등록해주세요</p>
        </div>
        <Link href="/boards/lost-found" className="btn-primary">글쓰기</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {posts.map((post) => (
          <div key={post.id} className="card">
            <div className="flex items-center gap-2 mb-3">
              <span className={post.status === "해결" ? "badge-success" : "badge-danger"}>
                {post.status}
              </span>
            </div>
            <h3 className="font-semibold text-dark mb-2">{post.title}</h3>
            <p className="text-sm text-gray-text line-clamp-3">{post.content}</p>
            <div className="flex gap-3 mt-3 text-xs text-gray-text">
              <span>{post.author}</span>
              <span>{post.createdAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
