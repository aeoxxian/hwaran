import Link from "next/link";
import { mockNotices } from "@/lib/mock-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "공지사항" };

export default function NoticesPage() {
  const pinned = mockNotices.filter((n) => n.isPinned);
  const regular = mockNotices.filter((n) => !n.isPinned);

  return (
    <div className="container-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">공지사항</h1>
        <p className="section-subtitle">동아리연합회의 공식 공지사항입니다</p>
      </div>

      {pinned.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">중요 공지</h2>
          <div className="space-y-2">
            {pinned.map((notice) => (
              <Link key={notice.id} href={`/notices/${notice.id}`} className="block card !p-4 border-l-4 !border-l-primary group">
                <div className="flex items-center gap-3">
                  <span className="badge-primary shrink-0">중요</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold group-hover:text-primary transition-colors truncate">{notice.title}</h3>
                    <div className="flex gap-3 mt-1 text-sm text-gray-text">
                      <span>{notice.author}</span>
                      <span>{notice.createdAt}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface rounded-xl border border-gray-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-light">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-text uppercase tracking-wider">번호</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-text uppercase tracking-wider">제목</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-text uppercase tracking-wider hidden sm:table-cell">작성자</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-text uppercase tracking-wider hidden md:table-cell">작성일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-border">
            {regular.map((notice, idx) => (
              <tr key={notice.id} className="hover:bg-gray-light/50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-text">{regular.length - idx}</td>
                <td className="px-6 py-4">
                  <Link href={`/notices/${notice.id}`} className="font-medium text-dark hover:text-primary transition-colors">
                    {notice.title}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-text hidden sm:table-cell">{notice.author}</td>
                <td className="px-6 py-4 text-sm text-gray-text hidden md:table-cell">{notice.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
