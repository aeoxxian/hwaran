"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { BoardComment } from "@/lib/types";

export default function CommentThread({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<BoardComment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    fetch(`/api/boards/${postId}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    const res = await fetch(`/api/boards/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error || "Failed to write comment.");
      return;
    }
    setContent("");
    reload();
  }

  return (
    <section className="card">
      <h2 className="text-lg font-semibold text-dark mb-4">Comments</h2>

      {loading ? (
        <p className="text-sm text-gray-text">Loading...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-text">No comments yet.</p>
      ) : (
        <ul className="space-y-3 mb-4">
          {comments.map((comment) => (
            <li key={comment.id} className="border border-gray-border rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-gray-text mb-1">
                <span className="font-medium text-dark">{comment.authorName}</span>
                {comment.isAdminComment && <span className="badge-primary">Admin</span>}
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
            placeholder="Write a comment"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit" className="btn-primary !px-4 !py-2 text-sm">
            Submit
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-text">Sign in to leave a comment.</p>
      )}
    </section>
  );
}
