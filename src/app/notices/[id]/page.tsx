import Link from "next/link";
import { mockNotices } from "@/lib/mock-data";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return mockNotices.map((n) => ({ id: n.id }));
}

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params;
  const notice = mockNotices.find((n) => n.id === id);
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
          {notice.content.split("\n").map((line, i) => (
            <p key={i} className={`${line === "" ? "h-4" : "text-dark leading-relaxed"}`}>
              {line}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
