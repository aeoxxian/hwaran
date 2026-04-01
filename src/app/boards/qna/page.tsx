import Link from "next/link";
import { mockBoardPosts } from "@/lib/mock-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "문의 게시판" };

export default function QnAPage() {
  const posts = mockBoardPosts.filter((p) => p.category === "qna");

  return (
    <div className="container-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark">문의 게시판</h1>
          <p className="section-subtitle">궁금한 사항을 문의해주세요</p>
        </div>
        <Link href="/boards/qna" className="btn-primary">글쓰기</Link>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="card !p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={post.status === "답변완료" ? "badge-success" : "badge-warning"}>
                    {post.status}
                  </span>
                </div>
                <h3 className="font-semibold text-dark">{post.title}</h3>
                <p className="text-sm text-gray-text mt-1 line-clamp-1">{post.content}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-text">
                  <span>{post.author}</span>
                  <span>{post.createdAt}</span>
                </div>
              </div>
            </div>
            {post.reply && (
              <div className="mt-4 p-3 rounded-lg bg-primary-50 border-l-4 border-primary">
                <p className="text-sm font-medium text-primary-dark mb-1">답변</p>
                <p className="text-sm text-dark">{post.reply}</p>
                <p className="text-xs text-gray-text mt-1">{post.replyDate}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
