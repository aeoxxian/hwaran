import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import type { Draft } from "@/lib/types";

async function getDrafts(): Promise<Draft[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/admin/drafts`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.drafts || [];
  } catch {
    return [];
  }
}

export const metadata = { title: "기안 목록" };

export default async function DraftsPage() {
  const drafts = await getDrafts();

  const statusOrder: Record<string, number> = {
    "1차검토중": 0,
    "최종검토중": 1,
    "임시저장": 2,
    "반려": 3,
    "승인": 4,
  };
  const sorted = [...drafts].sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">기안 목록</h1>
          <p className="text-sm text-gray-500 mt-1">기안 상신 및 결재 현황</p>
        </div>
        <Link
          href="/admin/drafts/new"
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + 기안 작성
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>기안이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">제목</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">유형</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">작성자</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">작성일</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((draft) => (
                <tr key={draft.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/drafts/${draft.id}`} className="font-medium text-gray-900 hover:text-primary">
                      {draft.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{draft.type}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {draft.authorName}
                    <span className="ml-1 text-xs text-gray-400">({draft.authorRole === "국장팀장" ? "국장/팀장" : draft.authorRole})</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={draft.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{draft.createdAt.split("T")[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
