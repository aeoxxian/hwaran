"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import type { ApplicationStatus, ApplicationType, ClubApplication } from "@/lib/types";

interface Props {
  initial: ClubApplication[];
}

const TYPE_OPTIONS: Array<{ value: "전체" | ApplicationType; label: string }> = [
  { value: "전체", label: "전체" },
  { value: "예산", label: "예산" },
  { value: "동아리등록", label: "동아리등록" },
  { value: "물품사용", label: "물품사용" },
  { value: "기타", label: "기타" },
];

const STATUS_OPTIONS: Array<{ value: "전체" | ApplicationStatus; label: string }> = [
  { value: "전체", label: "전체" },
  { value: "대기", label: "대기" },
  { value: "1차검토중", label: "1차검토중" },
  { value: "최종검토중", label: "최종검토중" },
  { value: "승인", label: "승인" },
  { value: "반려", label: "반려" },
];

export default function ApplicationsClient({ initial }: Props) {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<"전체" | ApplicationType>("전체");
  const [statusFilter, setStatusFilter] = useState<"전체" | ApplicationStatus>("전체");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkComment, setBulkComment] = useState("");
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ ok: number; fail: number } | null>(null);
  const [bulkError, setBulkError] = useState("");

  const filtered = useMemo(() => {
    return initial.filter((app) => {
      if (typeFilter !== "전체" && app.type !== typeFilter) return false;
      if (statusFilter !== "전체" && app.status !== statusFilter) return false;
      return true;
    });
  }, [initial, typeFilter, statusFilter]);

  const allSelected = filtered.length > 0 && filtered.every((a) => selectedIds.has(a.id));

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((a) => a.id)));
    }
  }

  async function runBulk(action: "승인" | "반려") {
    if (selectedIds.size === 0) {
      setBulkError("처리할 서류를 선택해주세요.");
      return;
    }
    setBulkError("");
    setBulkResult(null);
    setBulkRunning(true);

    let ok = 0;
    let fail = 0;
    const ids = Array.from(selectedIds);
    // 순차 처리 — 동시 요청 시 Notion rate limit 회피.
    for (const id of ids) {
      try {
        const res = await fetch(`/api/admin/applications/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, reviewComment: bulkComment }),
        });
        if (res.ok) ok += 1;
        else fail += 1;
      } catch {
        fail += 1;
      }
    }

    setBulkResult({ ok, fail });
    setBulkRunning(false);
    setSelectedIds(new Set());
    setBulkComment("");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* 필터 + 일괄 처리 영역 */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">유형</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">상태</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-gray-500 ml-auto">
            {filtered.length}건 / 선택 {selectedIds.size}건
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={bulkComment}
            onChange={(e) => setBulkComment(e.target.value)}
            placeholder="일괄 검토 의견 (선택)"
            className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="button"
            onClick={() => runBulk("승인")}
            disabled={bulkRunning || selectedIds.size === 0}
            className="bg-green-600 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {bulkRunning ? "처리 중..." : `일괄 승인 (${selectedIds.size})`}
          </button>
          <button
            type="button"
            onClick={() => runBulk("반려")}
            disabled={bulkRunning || selectedIds.size === 0}
            className="border border-red-300 text-red-600 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {bulkRunning ? "처리 중..." : `일괄 반려 (${selectedIds.size})`}
          </button>
        </div>

        {bulkError && <p className="text-sm text-red-600">{bulkError}</p>}
        {bulkResult && (
          <p className="text-sm text-gray-600">
            처리 결과: 성공 {bulkResult.ok}건 / 실패 {bulkResult.fail}건
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border border-gray-200 rounded-xl bg-white">
          <p className="text-4xl mb-3">📁</p>
          <p>조건에 해당하는 서류 신청이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="전체 선택"
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">제목</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">유형</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">동아리</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">제출자</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">제출일</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(app.id)}
                      onChange={() => toggle(app.id)}
                      aria-label={`${app.title} 선택`}
                    />
                  </td>
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
