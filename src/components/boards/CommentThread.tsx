"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { BoardComment } from "@/lib/types";

export default function CommentThread({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<BoardComment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    fetch(`/api/boards/${postId}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [postId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/boards/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "댓글 작성에 실패했습니다.");
        return;
      }
      setContent("");
      reload();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card">
      <h2 className="text-lg font-semibold text-dark mb-4">
        댓글 <span className="text-gray-text font-normal">({comments.length})</span>
      </h2>

      {loading ? (
        <p className="text-sm text-gray-text">불러오는 중...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-text">아직 작성된 댓글이 없습니다.</p>
      ) : (
        <ul className="space-y-3 mb-4">
          {comments.map((comment) => (
            <li key={comment.id} className="border border-gray-border rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-gray-text mb-1">
                <span className="font-medium text-dark">{comment.authorName}</span>
                {comment.isAdminComment && <span className="badge-primary">관리자</span>}
                <span>{comment.createdAt}</span>
              </div>
              <p className="text-sm text-dark whitespace-pre-wrap">{comment.content}</p>
            </li>
          ))}
        </ul>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            className="input-field min-h-20"
            placeholder="댓글을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="btn-primary !px-4 !py-2 text-sm disabled:opacity-50"
          >
            {submitting ? "등록 중..." : "댓글 등록"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-text">댓글을 작성하려면 로그인해주세요.</p>
      )}
    </section>
  );
}
