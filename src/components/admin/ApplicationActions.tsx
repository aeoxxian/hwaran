"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ApplicationActionsProps {
  applicationId: string;
}

export default function ApplicationActions({ applicationId }: ApplicationActionsProps) {
  const { adminLevel } = useAuth();
  const router = useRouter();
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (adminLevel < 2) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-500">
        서류신청 처리 권한이 없습니다. (국장/팀장 이상)
      </div>
    );
  }

  async function handleAction(action: "승인" | "반려") {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reviewComment }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "처리 실패"); return; }
      router.refresh();
    } catch {
      setError("오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="font-semibold text-gray-900 mb-4">서류 검토</h2>
      <textarea
        value={reviewComment}
        onChange={(e) => setReviewComment(e.target.value)}
        rows={3}
        placeholder="검토 의견을 입력하세요 (선택)"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
      />
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => handleAction("반려")}
          disabled={submitting}
          className="border border-red-300 text-red-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          반려
        </button>
        <button
          onClick={() => handleAction("승인")}
          disabled={submitting}
          className="bg-green-600 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? "처리 중..." : "승인"}
        </button>
      </div>
    </div>
  );
}
