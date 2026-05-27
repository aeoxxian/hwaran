import { getApplications } from "@/lib/data";
import { requireAdminLevel } from "@/lib/server-auth";
import ApplicationsClient from "./ApplicationsClient";

export const metadata = { title: "서류신청 관리" };
export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  await requireAdminLevel(2);
  // 서버 컴포넌트에서는 lib/data 를 직접 호출합니다.
  // (자기 자신의 API를 fetch 하면 인증 쿠키가 전달되지 않아 401이 나며 빈 목록이 됨)
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

      <ApplicationsClient initial={sorted} />
    </div>
  );
}
