import { mockBoardPosts } from "@/lib/mock-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "동아리 홍보글" };

export default function PromotionsPage() {
  const posts = mockBoardPosts.filter((p) => p.category === "promotions");

  return (
    <div className="container-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">동아리 홍보글</h1>
        <p className="section-subtitle">각 동아리의 소식과 홍보를 확인하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="card">
            {post.clubName && (
              <span className="badge-primary mb-3">{post.clubName}</span>
            )}
            <h3 className="text-lg font-bold text-dark mt-1">{post.title}</h3>
            <div className="mt-3 text-sm text-gray-text leading-relaxed whitespace-pre-line">
              {post.content}
            </div>
            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-border text-xs text-gray-text">
              <span>{post.author}</span>
              <span>{post.createdAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
