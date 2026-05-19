import Link from "next/link";
import { getNoticeById } from "@/lib/data";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params;
  const notice = await getNoticeById(id);
  if (!notice) notFound();

  return (
    <div className="container-page">
      <Link href="/notices" className="inline-flex items-center gap-1 text-gray-text hover:text-primary transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        목록으로
      </Link>

      <article className="card">
        <div className="flex items-center gap-3 mb-4">
          {notice.isPinned && <span className="badge-primary">중요</span>}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark mb-4">{notice.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-text pb-6 border-b border-gray-border">
          <span>작성자: {notice.author}</span>
          <span>작성일: {notice.createdAt}</span>
        </div>
        <div className="pt-6 prose max-w-none">
          {(notice.content || "").split("\n").map((line, i) => (
            <p key={i} className={`${line === "" ? "h-4" : "text-dark leading-relaxed"}`}>
              {line}
            </p>
          ))}
        </div>
        {notice.attachments && notice.attachments.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-border">
            <h2 className="text-sm font-semibold text-dark mb-2">첨부파일</h2>
            <ul className="space-y-1">
              {notice.attachments.map((url, i) => (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-primary-dark break-all"
                  >
                    첨부파일 {i + 1}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </div>
  );
}
