import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import ApplicationActions from "@/components/admin/ApplicationActions";
import type { ClubApplication } from "@/lib/types";

async function getApplication(id: string): Promise<ClubApplication | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/admin/applications/${id}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.application || null;
  } catch {
    return null;
  }
}

export const metadata = { title: "서류 상세" };

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = await getApplication(id);
  if (!app) notFound();

  const canReview = app.status === "대기" || app.status === "1차검토중" || app.status === "최종검토중";

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/applications" className="text-sm text-gray-500 hover:text-primary">
          ← 서류신청 목록
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold text-gray-900">{app.title}</h1>
          <StatusBadge status={app.status} />
        </div>
        <div className="flex gap-4 mt-2 text-sm text-gray-500 flex-wrap">
          <span>유형: <strong>{app.type}</strong></span>
          <span>동아리: <strong>{app.clubName}</strong></span>
          <span>제출자: <strong>{app.submitterName}</strong></span>
          <span>제출일: {app.submittedAt}</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* 첨부파일 */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-3">첨부파일</h2>
          {app.attachments.length === 0 ? (
            <p className="text-sm text-gray-400">첨부파일이 없습니다.</p>
          ) : (
            <ul className="space-y-1">
              {app.attachments.map((url, i) => (
                <li key={i}>
                  <a href={url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                    📎 첨부파일 {i + 1}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 기존 검토 이력 */}
        {app.reviewComment && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-3">검토 결과</h2>
            <div className="flex gap-4 text-sm text-gray-500 mb-2">
              <span>검토자: <strong>{app.reviewerName}</strong></span>
              <span>검토일: {app.reviewedAt}</span>
            </div>
            <p className="text-sm text-gray-700">{app.reviewComment}</p>
          </div>
        )}

        {/* 승인/반려 액션 */}
        {canReview && <ApplicationActions applicationId={app.id} />}
      </div>
    </div>
  );
}
