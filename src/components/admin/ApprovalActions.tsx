"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { roleMatchesReviewer, type UserRole } from "@/lib/types";

interface ApprovalActionsProps {
  draftId: string;
  status: string;
  currentReviewerRole?: UserRole;
}

export default function ApprovalActions({ draftId, status, currentReviewerRole }: ApprovalActionsProps) {
  const { user, adminLevel } = useAuth();
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canAct =
    adminLevel >= 2 &&
    (status === "1차검토중" || status === "최종검토중") &&
    !!user?.role &&
    roleMatchesReviewer(user.role, currentReviewerRole);

  if (!canAct) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-500">
        {status === "승인" || status === "반려"
          ? "결재가 완료된 기안입니다."
          : "현재 결재 차례가 아닙니다."}
      </div>
    );
  }

  async function handleAction(action: "승인" | "반려" | "검토의견" | "수정요청") {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/drafts/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment }),
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
      <h2 className="font-semibold text-gray-900 mb-4">결재 처리</h2>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="검토 의견을 입력하세요 (선택)"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
      />
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={() => handleAction("검토의견")}
          disabled={submitting}
          className="border border-blue-300 text-blue-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-50 disabled:opacity-50 transition-colors"
        >
          검토의견
        </button>
        <button
          onClick={() => handleAction("수정요청")}
          disabled={submitting}
          className="border border-amber-300 text-amber-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-amber-50 disabled:opacity-50 transition-colors"
        >
          수정요청
        </button>
        <div className="flex-1" />
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
