import Link from "next/link";
import { getNotices } from "@/lib/data";
import { requireAdminLevel } from "@/lib/server-auth";

export const metadata = { title: "공지 목록" };
export const dynamic = "force-dynamic";

export default async function AdminNoticesPage() {
  await requireAdminLevel(2);
  const notices = await getNotices();

  const sorted = [...notices].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">공지 목록</h1>
          <p className="text-sm text-gray-500 mt-1">등록된 공지사항을 관리합니다.</p>
        </div>
        <Link
          href="/admin/notices/new"
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + 공지 작성
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📢</p>
          <p>등록된 공지가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">제목</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">작성자</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">작성일</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">중요여부</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((notice) => (
                <tr key={notice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/notices/${notice.id}`} className="font-medium text-gray-900 hover:text-primary">
                      {notice.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{notice.author}</td>
                  <td className="px-4 py-3 text-gray-500">{(notice.createdAt ?? "").split("T")[0]}</td>
                  <td className="px-4 py-3">
                    {notice.isPinned ? <span className="badge-primary">중요</span> : <span className="text-gray-400">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
