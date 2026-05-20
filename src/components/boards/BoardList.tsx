"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BoardPost } from "@/lib/types";

type BoardCategory = BoardPost["category"];

const BOARD_META: Record<BoardCategory, { title: string; subtitle: string }> = {
  qna: { title: "문의 게시판", subtitle: "궁금한 점을 질문하고 답변을 확인하세요." },
  complaints: { title: "민원 게시판", subtitle: "민원을 제출하고 처리 현황을 확인하세요." },
  "lost-found": { title: "분실물 게시판", subtitle: "분실물과 습득물을 등록하고 확인하세요." },
  promotions: { title: "동아리 홍보글", subtitle: "동아리 소식과 홍보 게시글을 확인하세요." },
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
            placeholder="제목/내용 검색"
            className="input-field !py-2 !px-3 !w-56"
          />
          <Link href={`/boards/${category}/new`} className="btn-primary !px-4 !py-2">
            글쓰기
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="card text-gray-text">불러오는 중...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="card text-gray-text">게시글이 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <article key={post.id} className="card !p-4">
              <div className="flex items-center gap-2 mb-2">
                {post.status && <span className="badge bg-gray-light text-gray-text">{post.status}</span>}
                {post.approvalStatus === "pending" && <span className="badge-warning">검토 중</span>}
                {post.isAnonymous && <span className="badge bg-gray-light text-gray-text">익명</span>}
              </div>
              <Link href={`/boards/${category}/${post.id}`} className="block hover:opacity-85 transition-opacity">
                <h3 className="font-semibold text-dark">{post.title}</h3>
                <p className="text-sm text-gray-text mt-1 line-clamp-2">{post.content}</p>
              </Link>
              <div className="flex gap-3 mt-2 text-xs text-gray-text">
                <span>{post.isAnonymous ? "익명" : post.author}</span>
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
