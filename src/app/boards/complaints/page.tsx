import Link from "next/link";
import { mockBoardPosts } from "@/lib/mock-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "민원 게시판" };

export default function ComplaintsPage() {
  const posts = mockBoardPosts.filter((p) => p.category === "complaints");

  return (
    <div className="container-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark">민원 게시판</h1>
          <p className="section-subtitle">건의사항이나 민원을 접수해주세요</p>
        </div>
        <Link href="/boards/complaints" className="btn-primary">글쓰기</Link>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="card !p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={post.status === "해결" ? "badge-success" : "badge-warning"}>
                    {post.status}
                  </span>
                  {post.isAnonymous && (
                    <span className="badge bg-gray-light text-gray-text">익명</span>
                  )}
                </div>
                <h3 className="font-semibold text-dark">{post.title}</h3>
                <p className="text-sm text-gray-text mt-1 line-clamp-2">{post.content}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-text">
                  <span>{post.isAnonymous ? "익명" : post.author}</span>
                  <span>{post.createdAt}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
