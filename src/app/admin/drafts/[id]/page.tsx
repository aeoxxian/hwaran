import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import ApprovalTimeline from "@/components/admin/ApprovalTimeline";
import ApprovalActions from "@/components/admin/ApprovalActions";
import type { Draft } from "@/lib/types";

async function getDraft(id: string): Promise<Draft | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/admin/drafts/${id}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.draft || null;
  } catch {
    return null;
  }
}

export const metadata = { title: "기안 상세" };

export default async function DraftDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const draft = await getDraft(id);
  if (!draft) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/drafts" className="text-sm text-gray-500 hover:text-primary">
          ← 기안 목록
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold text-gray-900">{draft.title}</h1>
          <StatusBadge status={draft.status} />
        </div>
        <div className="flex gap-4 mt-2 text-sm text-gray-500">
          <span>유형: <strong>{draft.type}</strong></span>
          <span>작성자: <strong>{draft.authorName}</strong> ({draft.authorRole === "국장팀장" ? "국장/팀장" : draft.authorRole})</span>
          <span>작성일: {draft.createdAt.split("T")[0]}</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* 내용 */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-3">기안 내용</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{draft.content}</p>
          {draft.attachments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">첨부파일</p>
              <ul className="space-y-1">
                {draft.attachments.map((url, i) => (
                  <li key={i}>
                    <a href={url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                      📎 첨부파일 {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 결재 타임라인 */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">결재 이력</h2>
          <ApprovalTimeline comments={draft.comments} currentStatus={draft.status} />
        </div>

        {/* 결재 액션 (클라이언트 컴포넌트) */}
        <ApprovalActions draftId={draft.id} status={draft.status} currentReviewerRole={draft.currentReviewerRole} />
      </div>
    </div>
  );
}
