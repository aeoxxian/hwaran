"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { BoardPost } from "@/lib/types";

type BoardCategory = BoardPost["category"];

interface BoardEditorProps {
  category: BoardCategory;
  postId?: string;
}

export default function BoardEditor({ category, postId }: BoardEditorProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isEditMode = Boolean(postId);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    location: "",
    isAnonymous: false,
    clubName: "",
  });

  useEffect(() => {
    if (!isEditMode || !postId) return;
    fetch(`/api/boards/${postId}`)
      .then((r) => r.json())
      .then((d) => {
        const post = d.post as BoardPost | undefined;
        if (!post) return;
        setForm({
          title: post.title || "",
          content: post.content || "",
          location: post.location || "",
          isAnonymous: Boolean(post.isAnonymous),
          clubName: post.clubName || "",
        });
        setAttachments(post.attachments || []);
      })
      .catch(() => setError("게시글을 불러오는 데 실패했습니다."))
      .finally(() => setLoading(false));
  }, [isEditMode, postId]);

  const pageTitle = useMemo(() => (isEditMode ? "게시글 수정" : "게시글 작성"), [isEditMode]);

  async function uploadFiles(): Promise<string[]> {
    const uploaded: string[] = [...attachments];
    for (const file of files) {
      const signRes = await fetch("/api/boards/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const signData = await signRes.json();
      if (!signRes.ok) {
        if (signRes.status === 503) continue;
        throw new Error(signData.error || "Failed to get upload URL.");
      }
      await fetch(signData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      uploaded.push(signData.fileUrl);
    }
    return uploaded;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.content.trim()) {
      setError("제목과 내용을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const uploadedAttachments = await uploadFiles();
      const endpoint = isEditMode ? `/api/boards/${postId}` : "/api/boards";
      const method = isEditMode ? "PATCH" : "POST";
      const payload = {
        ...form,
        category,
        author: user?.name,
        attachments: uploadedAttachments,
      };
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed.");
        return;
      }

      const nextId = isEditMode ? postId : data.post?.id || data.id;
      router.push(nextId ? `/boards/${category}/${nextId}` : `/boards/${category}`);
      router.refresh();
    } catch {
      setError("요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container-page">
        <div className="card text-gray-text">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="container-page">
      <div className="max-w-3xl card">
        <h1 className="text-2xl font-bold text-dark mb-6">{pageTitle}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="input-field"
            placeholder="제목"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
          <textarea
            className="input-field min-h-44"
            placeholder="내용"
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
          />

          {category === "lost-found" && (
            <input
              className="input-field"
              placeholder="장소 (분실/습득 위치)"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            />
          )}

          <div>
            <input
              type="file"
              multiple
              className="input-field"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
            {(attachments.length > 0 || files.length > 0) && (
              <div className="mt-2 text-xs text-gray-text space-y-1">
                {attachments.map((url, idx) => (
                  <div key={`old-${idx}`}>기존 첨부파일 {idx + 1}: {url}</div>
                ))}
                {files.map((file, idx) => (
                  <div key={`new-${idx}`}>새 파일: {file.name}</div>
                ))}
              </div>
            )}
          </div>

          {category === "promotions" && (
            <input
              className="input-field"
              placeholder="동아리명"
              value={form.clubName}
              onChange={(e) => setForm((p) => ({ ...p, clubName: e.target.value }))}
            />
          )}

          {(category === "qna" || category === "complaints") && (
            <label className="inline-flex items-center gap-2 text-sm text-gray-text">
              <input
                type="checkbox"
                checked={form.isAnonymous}
                onChange={(e) => setForm((p) => ({ ...p, isAnonymous: e.target.checked }))}
              />
              익명으로 작성
            </label>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button disabled={saving} type="submit" className="btn-primary !px-4 !py-2">
              {saving ? "저장 중..." : isEditMode ? "수정 완료" : "등록"}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-outline !px-4 !py-2">
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
