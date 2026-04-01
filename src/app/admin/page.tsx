import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import type { Draft, ClubApplication } from "@/lib/types";

const BASE = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

async function getDrafts(): Promise<Draft[]> {
  try {
    const res = await fetch(`${BASE}/api/admin/drafts`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).drafts || [];
  } catch { return []; }
}

async function getApplications(): Promise<ClubApplication[]> {
  try {
    const res = await fetch(`${BASE}/api/admin/applications`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).applications || [];
  } catch { return []; }
}

export const metadata = { title: "관리자 대시보드" };

export default async function AdminDashboardPage() {
  const [drafts, applications] = await Promise.all([getDrafts(), getApplications()]);

  const pendingDrafts = drafts.filter((d) => d.status === "1차검토중" || d.status === "최종검토중");
  const pendingApps = applications.filter((a) => a.status === "대기" || a.status === "1차검토중" || a.status === "최종검토중");
  const recentDrafts = drafts.slice(0, 5);
  const recentApps = applications.slice(0, 5);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">처리해야 하는 업무를 한눈에 확인하세요.</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          label="결재 대기 기안"
          value={pendingDrafts.length}
          color="amber"
          href="/admin/drafts"
        />
        <SummaryCard
          label="처리 대기 서류"
          value={pendingApps.length}
          color="blue"
          href="/admin/applications"
        />
        <SummaryCard
          label="전체 기안"
          value={drafts.length}
          color="gray"
          href="/admin/drafts"
        />
        <SummaryCard
          label="전체 서류신청"
          value={applications.length}
          color="gray"
          href="/admin/applications"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 기안 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">최근 기안</h2>
            <Link href="/admin/drafts" className="text-xs text-primary hover:underline">
              전체 보기 →
            </Link>
          </div>
          {recentDrafts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">기안이 없습니다.</p>
          ) : (
            <ul className="space-y-3">
              {recentDrafts.map((d) => (
                <li key={d.id} className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/admin/drafts/${d.id}`} className="text-sm font-medium text-gray-900 hover:text-primary truncate block">
                      {d.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {d.authorName} · {d.createdAt.split("T")[0]}
                    </p>
                  </div>
                  <StatusBadge status={d.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 최근 서류신청 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">최근 서류신청</h2>
            <Link href="/admin/applications" className="text-xs text-primary hover:underline">
              전체 보기 →
            </Link>
          </div>
          {recentApps.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">서류신청이 없습니다.</p>
          ) : (
            <ul className="space-y-3">
              {recentApps.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/admin/applications/${a.id}`} className="text-sm font-medium text-gray-900 hover:text-primary truncate block">
                      {a.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {a.clubName} · {a.submittedAt}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 퀵 액션 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link
          href="/admin/drafts/new"
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-primary hover:shadow-sm transition-all"
        >
          <span className="text-2xl">✏️</span>
          <div>
            <p className="text-sm font-medium text-gray-900">기안 작성</p>
            <p className="text-xs text-gray-400">새 기안 상신</p>
          </div>
        </Link>
        <Link
          href="/admin/notices/new"
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-primary hover:shadow-sm transition-all"
        >
          <span className="text-2xl">📢</span>
          <div>
            <p className="text-sm font-medium text-gray-900">공지 작성</p>
            <p className="text-xs text-gray-400">새 공지사항 등록</p>
          </div>
        </Link>
        <Link
          href="/admin/notifications"
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-primary hover:shadow-sm transition-all"
        >
          <span className="text-2xl">🔔</span>
          <div>
            <p className="text-sm font-medium text-gray-900">알림</p>
            <p className="text-xs text-gray-400">내 알림 확인</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
  href,
}: {
  label: string;
  value: number;
  color: "amber" | "blue" | "green" | "red" | "gray";
  href: string;
}) {
  const colorClass = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
  }[color];

  return (
    <Link href={href} className={`rounded-xl border p-4 block hover:shadow-sm transition-shadow ${colorClass}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </Link>
  );
}
