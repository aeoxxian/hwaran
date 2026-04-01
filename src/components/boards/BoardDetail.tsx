"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { BoardPost } from "@/lib/types";
import CommentThread from "./CommentThread";

type BoardCategory = BoardPost["category"];

export default function BoardDetail({ category, id }: { category: BoardCategory; id: string }) {
  const { user, adminLevel } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<BoardPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/boards/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.post) throw new Error("not found");
        setPost(d.post);
      })
      .catch(() => setError("Failed to load post."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/boards/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Delete failed.");
      return;
    }
    router.push(`/boards/${category}`);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="container-page">
        <div className="card text-gray-text">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container-page">
        <div className="card text-red-600">{error || "Post not found."}</div>
      </div>
    );
  }

  const canManage = Boolean(user && (adminLevel > 0 || post.authorId === user.id));

  return (
    <div className="container-page">
      <article className="card max-w-4xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-dark">{post.title}</h1>
            <div className="mt-2 flex gap-3 text-xs text-gray-text">
              <span>{post.isAnonymous ? "Anonymous" : post.author}</span>
              <span>{post.createdAt}</span>
              {post.clubName && <span>{post.clubName}</span>}
            </div>
          </div>
          <Link href={`/boards/${category}`} className="btn-outline !px-3 !py-1.5 text-sm">
            List
          </Link>
        </div>

        <div className="whitespace-pre-wrap text-sm text-dark leading-relaxed">{post.content}</div>
        {post.location && <p className="text-sm text-gray-text mt-4">Location: {post.location}</p>}

        {post.reply && (
          <div className="mt-6 p-3 rounded-lg bg-primary-50 border-l-4 border-primary">
            <p className="text-sm font-medium text-primary-dark mb-1">Admin Reply</p>
            <p className="text-sm text-dark">{post.reply}</p>
            {post.replyDate && <p className="text-xs text-gray-text mt-1">{post.replyDate}</p>}
          </div>
        )}

        {canManage && (
          <div className="mt-6 flex gap-2">
            <Link href={`/boards/${category}/${id}/edit`} className="btn-outline !px-3 !py-1.5 text-sm">
              Edit
            </Link>
            <button onClick={handleDelete} className="btn-outline !px-3 !py-1.5 text-sm !border-red-400 !text-red-600">
              Delete
            </button>
          </div>
        )}
      </article>

      <div className="max-w-4xl mt-4">
        <CommentThread postId={id} />
      </div>
    </div>
  );
}
