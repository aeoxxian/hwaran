import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import type { ClubApplication } from "@/lib/types";

async function getApplications(): Promise<ClubApplication[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/admin/applications`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.applications || [];
  } catch {
    return [];
  }
}

export const metadata = { title: "서류신청 관리" };

export default async function ApplicationsPage() {
  const applications = await getApplications();

  const statusOrder: Record<string, number> = {
    대기: 0,
    "1차검토중": 1,
    "최종검토중": 2,
    반려: 3,
    승인: 4,
  };
  const sorted = [...applications].sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">서류신청 관리</h1>
        <p className="text-sm text-gray-500 mt-1">동아리에서 제출한 서류 신청을 검토합니다.</p>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📁</p>
          <p>서류 신청이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">제목</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">유형</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">동아리</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">제출자</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">제출일</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((app) => (
                <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/applications/${app.id}`} className="font-medium text-gray-900 hover:text-primary">
                      {app.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{app.type}</td>
                  <td className="px-4 py-3 text-gray-600">{app.clubName}</td>
                  <td className="px-4 py-3 text-gray-600">{app.submitterName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{app.submittedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
