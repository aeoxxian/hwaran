import Link from "next/link";
import { Notice } from "@/lib/types";

interface NoticePreviewProps {
  notices: Notice[];
}

export default function NoticePreview({ notices }: NoticePreviewProps) {
  const pinnedNotices = notices.filter((n) => n.isPinned);
  const recentNotices = notices.filter((n) => !n.isPinned).slice(0, 3);
  const displayNotices = [...pinnedNotices, ...recentNotices].slice(0, 5);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">공지사항</h2>
            <p className="section-subtitle">동아리연합회의 최신 소식을 확인하세요</p>
          </div>
          <Link href="/notices" className="btn-ghost text-primary hover:text-primary-dark">
            전체보기 &rarr;
          </Link>
        </div>

        <div className="space-y-3">
          {displayNotices.map((notice) => (
            <Link key={notice.id} href={`/notices/${notice.id}`} className="block card !p-4 group">
              <div className="flex items-start gap-3">
                {notice.isPinned && (
                  <span className="badge-primary shrink-0 mt-0.5">중요</span>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-dark group-hover:text-primary transition-colors truncate">
                    {notice.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-text">
                    <span>{notice.author}</span>
                    <span>{notice.createdAt}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
