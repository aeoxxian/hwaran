import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import { getApplicationsByUserId } from "@/lib/data";
import StatusBadge from "@/components/admin/StatusBadge";

export const metadata = { title: "내 서류 신청" };
export const dynamic = "force-dynamic";

export default async function MyApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const jar = await cookies();
  const token = jar.get("hwaran-token")?.value;
  if (!token) redirect("/auth/login?redirect=/my/applications");
  const user = verifyToken(token);
  if (!user) redirect("/auth/login?redirect=/my/applications");

  const { submitted } = await searchParams;
  const applications = await getApplicationsByUserId(user);

  return (
    <div className="container-page max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">내 서류 신청</h1>
        <p className="section-subtitle text-sm">내가 제출한 서류와 검토 상태를 확인할 수 있습니다.</p>
      </div>

      {submitted === "1" && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          서류가 정상적으로 제출되었습니다. 검토 결과는 이 페이지에서 확인할 수 있습니다.
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <Link
          href="/forms"
          className="text-sm font-medium text-primary hover:text-primary-dark"
        >
          + 새 서류 제출하기
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border border-gray-200 rounded-xl bg-white">
          <p className="text-4xl mb-3">📭</p>
          <p>제출한 서류가 없습니다.</p>
          <Link href="/forms" className="inline-block mt-3 text-sm text-primary hover:underline">
            서류 양식 보러가기
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">제목</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">유형</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">동아리</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">제출일</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">조치</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{app.title}</td>
                  <td className="px-4 py-3 text-gray-600">{app.type}</td>
                  <td className="px-4 py-3 text-gray-600">{app.clubName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{app.submittedAt}</td>
                  <td className="px-4 py-3">
                    {app.status === "반려" && (
                      <Link
                        href="/forms"
                        className="text-xs text-primary hover:underline"
                      >
                        다시 제출
                      </Link>
                    )}
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
