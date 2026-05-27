"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { BoardPost } from "@/lib/types";
import CommentThread from "./CommentThread";
import ModerationLogList from "./ModerationLogList";

type BoardCategory = BoardPost["category"];

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?.*)?$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;
const PDF_EXT = /\.pdf(\?.*)?$/i;

function filenameFromUrl(url: string, fallbackIdx: number): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").pop() || "";
    const decoded = decodeURIComponent(last);
    return decoded || `첨부파일 ${fallbackIdx + 1}`;
  } catch {
    return `첨부파일 ${fallbackIdx + 1}`;
  }
}

function AttachmentItem({ url, idx }: { url: string; idx: number }) {
  const name = filenameFromUrl(url, idx);
  if (IMAGE_EXT.test(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group border border-gray-border rounded-lg overflow-hidden hover:border-primary transition-colors"
      >
        <div className="relative w-full aspect-video bg-gray-light">
          <Image
            src={url}
            alt={name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        </div>
        <p className="px-3 py-2 text-xs text-gray-text truncate group-hover:text-primary">
          🖼️ {name}
        </p>
      </a>
    );
  }
  if (VIDEO_EXT.test(url)) {
    return (
      <div className="border border-gray-border rounded-lg overflow-hidden">
        <video src={url} controls className="w-full max-h-96 bg-black" />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-3 py-2 text-xs text-gray-text truncate hover:text-primary"
        >
          🎬 {name} (새 탭에서 열기)
        </a>
      </div>
    );
  }
  if (PDF_EXT.test(url)) {
    return (
      <div className="border border-gray-border rounded-lg overflow-hidden">
        <iframe src={url} className="w-full h-96 bg-white" title={name} />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-3 py-2 text-xs text-gray-text truncate hover:text-primary"
        >
          📄 {name} (새 탭에서 열기)
        </a>
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download
      className="flex items-center gap-3 border border-gray-border rounded-lg px-4 py-3 hover:border-primary hover:bg-primary-50/40 transition-colors"
    >
      <span className="text-xl">📎</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-dark truncate">{name}</p>
        <p className="text-xs text-gray-text">클릭하여 다운로드</p>
      </div>
    </a>
  );
}

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
      .catch(() => setError("게시글을 불러올 수 없습니다."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm("게시글을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/boards/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "삭제에 실패했습니다.");
      return;
    }
    router.push(`/boards/${category}`);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="container-page">
        <div className="card text-gray-text">불러오는 중...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container-page">
        <div className="card text-red-600">{error || "게시글을 찾을 수 없습니다."}</div>
      </div>
    );
  }

  const canManage = Boolean(user && (adminLevel > 0 || post.authorId === user.id));
  const allAttachments: string[] = [
    ...(post.images ?? []),
    ...(post.attachments ?? []),
  ].filter((u, i, arr) => u && arr.indexOf(u) === i);

  return (
    <div className="container-page">
      <article className="card max-w-4xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-dark">{post.title}</h1>
            <div className="mt-2 flex gap-3 text-xs text-gray-text">
              <span>{post.isAnonymous ? "익명" : post.author}</span>
              <span>{post.createdAt}</span>
              {post.clubName && <span>{post.clubName}</span>}
            </div>
          </div>
          <Link href={`/boards/${category}`} className="btn-outline !px-3 !py-1.5 text-sm">
            목록
          </Link>
        </div>

        <div className="whitespace-pre-wrap text-sm text-dark leading-relaxed">{post.content}</div>
        {post.location && <p className="text-sm text-gray-text mt-4">장소: {post.location}</p>}

        {allAttachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-border">
            <h2 className="text-sm font-semibold text-dark mb-3">
              첨부파일 <span className="text-gray-text font-normal">({allAttachments.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allAttachments.map((url, i) => (
                <AttachmentItem key={`${url}-${i}`} url={url} idx={i} />
              ))}
            </div>
          </div>
        )}

        {post.reply && (
          <div className="mt-6 p-3 rounded-lg bg-primary-50 border-l-4 border-primary">
            <p className="text-sm font-medium text-primary-dark mb-1">관리자 답변</p>
            <p className="text-sm text-dark whitespace-pre-wrap">{post.reply}</p>
            {post.replyDate && <p className="text-xs text-gray-text mt-1">{post.replyDate}</p>}
          </div>
        )}

        {canManage && (
          <div className="mt-6 flex gap-2">
            <Link href={`/boards/${category}/${id}/edit`} className="btn-outline !px-3 !py-1.5 text-sm">
              수정
            </Link>
            <button onClick={handleDelete} className="btn-outline !px-3 !py-1.5 text-sm !border-red-400 !text-red-600">
              삭제
            </button>
          </div>
        )}
      </article>

      <div className="max-w-4xl mt-4 space-y-4">
        {adminLevel > 0 && <ModerationLogList postId={id} />}
        <CommentThread postId={id} />
      </div>
    </div>
  );
}
