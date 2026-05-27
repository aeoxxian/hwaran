"use client";

import { useState } from "react";

interface DownloadButtonProps {
  formId: string;
  filename: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * 클라이언트에서 fetch → Blob → a.click() 으로 다운로드.
 * Content-Disposition 처리 차이와 무관하게 항상 동일한 한글 파일명으로 저장된다.
 */
export default function DownloadButton({
  formId,
  filename,
  className,
  children,
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/forms/${formId}/download`);
      if (!res.ok) {
        alert("파일을 다운로드할 수 없습니다.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // 다음 micro-task 에서 URL 해제 (Safari 호환)
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error(err);
      alert("다운로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={className}>
      {children}
    </button>
  );
}
