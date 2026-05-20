"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DRAFT_TYPE_OPTIONS } from "@/lib/constants";

export default function DraftForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("예산");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  /**
   * 파일을 Notion File Upload API로 직접 업로드합니다.
   * 응답으로 받은 fileUploadId 토큰을 attachments에 담아 기안 상신 시 함께 전송하면,
   * 서버에서 노션 페이지 생성 시 file_upload로 첨부합니다.
   * (실패 시 에러를 throw하여 사용자에게 알립니다.)
   */
  async function uploadFiles(): Promise<string[]> {
    const tokens: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/notion-upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `파일 업로드 실패: ${file.name}`);
      }
      const { fileUploadId } = await res.json();
      tokens.push(fileUploadId);
    }
    return tokens;
  }

  async function handleSubmit(asDraft: boolean) {
    if (!title.trim()) { setError("제목을 입력해주세요."); return; }
    if (!content.trim()) { setError("내용을 입력해주세요."); return; }
    setError("");

    try {
      setUploading(true);
      const attachments = await uploadFiles();
      setUploading(false);
      setSubmitting(true);

      const res = await fetch("/api/admin/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, type, attachments, asDraft }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "제출 실패"); return; }

      router.push("/admin/drafts");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {DRAFT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="기안 제목을 입력하세요"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          placeholder="기안 내용을 상세히 작성해주세요..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">첨부파일</label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <p className="text-sm text-gray-500">
            {files.length > 0
              ? files.map((f) => f.name).join(", ")
              : "클릭하여 파일을 선택하거나 드래그하세요"}
          </p>
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
        </div>
        {files.length > 0 && (
          <ul className="mt-2 space-y-1">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between text-xs text-gray-600">
                <span>📎 {f.name}</span>
                <button
                  type="button"
                  className="text-red-400 hover:text-red-600"
                  onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={uploading || submitting}
          className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          임시저장
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={uploading || submitting}
          className="flex-1 bg-primary text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {uploading ? "파일 업로드 중..." : submitting ? "상신 중..." : "기안 상신"}
        </button>
      </div>
    </div>
  );
}
