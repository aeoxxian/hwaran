"use client";

import { useEffect, useMemo, useState } from "react";
import type { BoardPost } from "@/lib/types";

const CATEGORIES: BoardPost["category"][] = ["qna", "complaints", "lost-found", "promotions"];
const CATEGORY_LABEL: Record<BoardPost["category"], string> = {
  qna: "문의",
  complaints: "민원",
  "lost-found": "분실물",
  promotions: "홍보글",
};

export default function AdminBoardsPage() {
  const [category, setCategory] = useState<BoardPost["category"]>("qna");
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const query = new URLSearchParams({ category, pageSize: "200" });
    const res = await fetch(`/api/boards?${query.toString()}`);
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [category]);

  async function moderate(id: string, action: "approve" | "reject" | "resolve" | "pending") {
    const res = await fetch(`/api/admin/boards/${id}/moderation`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note: noteMap[id] || "" }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "처리 실패");
      return;
    }
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: false }),
    }).catch(() => {});
    load();
  }

  const summary = useMemo(
    () => ({
      total: posts.length,
      pending: posts.filter((p) => p.approvalStatus === "pending" || p.status === "대기" || p.status === "미해결").length,
      resolved: posts.filter((p) => p.status === "해결" || p.approvalStatus === "approved").length,
    }),
    [posts]
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">커뮤니티 관리</h1>
        <p className="text-sm text-gray-500 mt-1">게시글 승인/반려/해결 상태를 처리합니다.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card !p-4"><p className="text-xs text-gray-500">전체</p><p className="text-2xl font-bold">{summary.total}</p></div>
        <div className="card !p-4"><p className="text-xs text-gray-500">처리대기</p><p className="text-2xl font-bold text-amber-600">{summary.pending}</p></div>
        <div className="card !p-4"><p className="text-xs text-gray-500">처리완료</p><p className="text-2xl font-bold text-green-600">{summary.resolved}</p></div>
      </div>

      <div className="flex gap-2 mb-4">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded text-sm border ${category === c ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200"}`}
          >
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card text-gray-500">불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="card text-gray-500">게시글이 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="card !p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">
                    {CATEGORY_LABEL[post.category]} · {post.createdAt}
                  </p>
                  <h3 className="font-semibold text-dark">{post.title}</h3>
                  <p className="text-sm text-gray-text mt-1 line-clamp-2">{post.content}</p>
                  <div className="flex gap-2 mt-2 text-xs">
                    {post.status && <span className="badge bg-gray-light text-gray-text">{post.status}</span>}
                    {post.approvalStatus && <span className="badge bg-gray-light text-gray-text">{post.approvalStatus}</span>}
                  </div>
                  <textarea
                    className="input-field mt-3 !py-2 text-sm"
                    placeholder="처리 메모 / 답변 입력 (선택)"
                    value={noteMap[post.id] || ""}
                    onChange={(e) => setNoteMap((prev) => ({ ...prev, [post.id]: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => moderate(post.id, "approve")} className="btn-primary !px-3 !py-1.5 text-sm">승인</button>
                  <button onClick={() => moderate(post.id, "reject")} className="btn-outline !px-3 !py-1.5 text-sm !border-red-300 !text-red-600">반려</button>
                  <button onClick={() => moderate(post.id, "resolve")} className="btn-outline !px-3 !py-1.5 text-sm">해결</button>
                  <button onClick={() => moderate(post.id, "pending")} className="btn-outline !px-3 !py-1.5 text-sm">대기</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
