"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AdminNoticeNewPage() {
  const router = useRouter();
  const { adminLevel } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (adminLevel < 2) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">🔒</p>
        <p>공지 작성 권한이 없습니다. (국장/팀장 이상)</p>
        <Link href="/admin" className="text-primary text-sm hover:underline mt-2 inline-block">
          대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  async function handleSubmit() {
    if (!title.trim()) { setError("제목을 입력해주세요."); return; }
    if (!content.trim()) { setError("내용을 입력해주세요."); return; }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, isPinned }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "공지 등록 실패"); return; }
      router.push("/notices");
      router.refresh();
    } catch {
      setError("오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-primary">
          ← 대시보드
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">공지 작성</h1>
        <p className="text-sm text-gray-500 mt-1">작성한 공지사항은 공지사항 게시판에 즉시 게시됩니다.</p>
      </div>

      <div className="max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="공지 제목을 입력하세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder="공지 내용을 작성하세요..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPinned"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="w-4 h-4 text-primary rounded focus:ring-primary"
          />
          <label htmlFor="isPinned" className="text-sm text-gray-700">
            중요 공지 (상단 고정)
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Link
            href="/admin"
            className="flex-1 text-center border border-gray-300 text-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            취소
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-primary text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? "등록 중..." : "공지 등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
