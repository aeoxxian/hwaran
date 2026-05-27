"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { FormCategory } from "@/lib/forms-catalog";
import type { ApplicationType } from "@/lib/types";

interface Props {
  formTemplateId: string;
  defaultTitle: string;
  category: FormCategory;
}

const APP_TYPES: ApplicationType[] = ["예산", "동아리등록", "물품사용", "기타"];

function deriveDefaultType(category: FormCategory): ApplicationType {
  switch (category) {
    case "예산안":
    case "결산":
      return "예산";
    case "동아리 등록":
    case "초과 등록":
      return "동아리등록";
    default:
      return "기타";
  }
}

export default function SubmitClient({ formTemplateId, defaultTitle, category }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const defaultType = useMemo(() => deriveDefaultType(category), [category]);

  const [title, setTitle] = useState(defaultTitle);
  const [clubName, setClubName] = useState("");
  const [type, setType] = useState<ApplicationType>(defaultType);
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 사용자 정보가 로드되면 기본값을 채워준다.
  useEffect(() => {
    if (user) {
      setClubName((prev) => prev || user.clubName || "");
      setTitle((prev) => {
        // 사용자가 직접 수정한 적이 없으면 동아리명을 합쳐서 보강.
        if (prev === defaultTitle && user.clubName) {
          return `${defaultTitle} - ${user.clubName}`;
        }
        return prev;
      });
    }
  }, [user, defaultTitle]);

  if (loading) {
    return <div className="text-sm text-gray-500">로그인 정보 확인 중...</div>;
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm">
        <p className="font-medium text-amber-900 mb-2">로그인이 필요합니다.</p>
        <p className="text-amber-800 mb-3">서류를 제출하려면 먼저 로그인해주세요.</p>
        <Link
          href={`/auth/login?redirect=/forms/${formTemplateId}/submit`}
          className="inline-block bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          로그인 페이지로 이동
        </Link>
      </div>
    );
  }

  async function uploadOneFile(file: File): Promise<string> {
    const presignRes = await fetch("/api/forms/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream" }),
    });
    if (!presignRes.ok) {
      const data = await presignRes.json().catch(() => ({}));
      throw new Error(data.error || "업로드 URL 발급 실패");
    }
    const { uploadUrl, fileUrl } = (await presignRes.json()) as { uploadUrl: string; fileUrl: string };
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!putRes.ok) throw new Error("S3 업로드 실패");
    return fileUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (files.length === 0) {
      setError("작성한 파일을 1개 이상 첨부해주세요.");
      return;
    }
    if (!clubName.trim()) {
      setError("동아리명을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const uploaded: string[] = [];
      for (const f of files) {
        const url = await uploadOneFile(f);
        uploaded.push(url);
      }

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formTemplateId,
          title: title.trim(),
          type,
          clubName: clubName.trim(),
          attachments: uploaded,
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "제출 실패");
      }

      router.push("/my/applications?submitted=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "제출 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">동아리명</label>
          <input
            type="text"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ApplicationType)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
          >
            {APP_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          작성한 양식 파일 첨부 <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark"
        />
        {files.length > 0 && (
          <ul className="mt-2 space-y-1 text-xs text-gray-600">
            {files.map((f, i) => (
              <li key={i}>• {f.name} ({Math.round(f.size / 1024)} KB)</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">제출자 메모 (선택)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="검토자에게 전달할 내용을 입력하세요"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex justify-end gap-3">
        <Link
          href="/forms"
          className="border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="bg-primary text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {submitting ? "제출 중..." : "제출하기"}
        </button>
      </div>
    </form>
  );
}
