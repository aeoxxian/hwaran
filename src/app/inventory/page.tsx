import { getInventory } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "물품 관리" };

const statusColors: Record<string, string> = {
  "사용가능": "badge-success",
  "대여중": "badge-warning",
  "수리중": "badge-danger",
  "폐기": "badge bg-gray-light text-gray-text",
};

export default async function InventoryPage() {
  const inventory = await getInventory();

  return (
    <div className="container-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">물품 관리</h1>
        <p className="section-subtitle">동아리연합회 물품 현황을 확인하세요</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "전체", count: inventory.length, color: "bg-gray-light text-dark" },
          { label: "사용가능", count: inventory.filter((i) => i.status === "사용가능").length, color: "bg-green-50 text-green-700" },
          { label: "대여중", count: inventory.filter((i) => i.status === "대여중").length, color: "bg-yellow-50 text-yellow-700" },
          { label: "수리중", count: inventory.filter((i) => i.status === "수리중").length, color: "bg-red-50 text-red-700" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-4 text-center ${stat.color}`}>
            <div className="text-2xl font-bold">{stat.count}</div>
            <div className="text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-gray-border overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-light">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-text uppercase">물품명</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-text uppercase">수량</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-text uppercase">상태</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-text uppercase">보관 위치</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-text uppercase">비고</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-border">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-light/50 transition-colors">
                <td className="px-6 py-4 font-medium text-dark">{item.name}</td>
                <td className="px-6 py-4 text-sm">{item.quantity}</td>
                <td className="px-6 py-4">
                  <span className={statusColors[item.status] || "badge"}>{item.status}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-text">{item.location}</td>
                <td className="px-6 py-4 text-sm text-gray-text">{item.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
