"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BoardPost } from "@/lib/types";

type BoardCategory = BoardPost["category"];

const BOARD_META: Record<BoardCategory, { title: string; subtitle: string }> = {
  qna: { title: "QnA Board", subtitle: "Ask questions and check replies." },
  complaints: { title: "Complaints Board", subtitle: "Submit complaints and track status." },
  "lost-found": { title: "Lost and Found", subtitle: "Register lost and found items." },
  promotions: { title: "Club Promotions", subtitle: "Check club announcements and promotions." },
};

export default function BoardList({ category }: { category: BoardCategory }) {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams({ category, pageSize: "100" });
    fetch(`/api/boards?${query.toString()}`)
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [category]);

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
  }, [posts, search]);

  const meta = BOARD_META[category];

  return (
    <div className="container-page">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark">{meta.title}</h1>
          <p className="section-subtitle">{meta.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title/content"
            className="input-field !py-2 !px-3 !w-56"
          />
          <Link href={`/boards/${category}/new`} className="btn-primary !px-4 !py-2">
            Write
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="card text-gray-text">Loading...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="card text-gray-text">No posts found.</div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <article key={post.id} className="card !p-4">
              <div className="flex items-center gap-2 mb-2">
                {post.status && <span className="badge bg-gray-light text-gray-text">{post.status}</span>}
                {post.approvalStatus === "pending" && <span className="badge-warning">Pending</span>}
                {post.isAnonymous && <span className="badge bg-gray-light text-gray-text">Anonymous</span>}
              </div>
              <Link href={`/boards/${category}/${post.id}`} className="block hover:opacity-85 transition-opacity">
                <h3 className="font-semibold text-dark">{post.title}</h3>
                <p className="text-sm text-gray-text mt-1 line-clamp-2">{post.content}</p>
              </Link>
              <div className="flex gap-3 mt-2 text-xs text-gray-text">
                <span>{post.isAnonymous ? "Anonymous" : post.author}</span>
                <span>{post.createdAt}</span>
                {post.clubName && <span>{post.clubName}</span>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
