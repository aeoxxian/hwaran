import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FORMS_CATALOG } from "@/lib/forms-catalog";
import SubmitClient from "./Client";

export const metadata: Metadata = {
  title: "서류 제출",
  description: "작성한 양식을 업로드하여 화란에 제출합니다.",
};

export const dynamic = "force-dynamic";

export default async function SubmitFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = FORMS_CATALOG.find((f) => f.id === id);
  if (!template) notFound();

  return (
    <div className="container-page max-w-2xl">
      <div className="mb-6">
        <Link href="/forms" className="text-sm text-gray-500 hover:text-primary">
          ← 서류 양식 목록
        </Link>
        <h1 className="text-2xl font-bold text-dark mt-2">{template.displayName} 제출</h1>
        {template.description && (
          <p className="text-sm text-gray-text mt-1">{template.description}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          분류: <strong>{template.category}</strong> · 파일 유형: <strong className="uppercase">{template.fileType}</strong>
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-gray-border bg-surface p-5 text-sm text-gray-text">
        <p className="mb-2">제출 절차</p>
        <ol className="list-decimal list-inside space-y-1 leading-relaxed">
          <li>
            아래 <a href={template.downloadUrl} download className="text-primary hover:underline">양식 파일</a> 을 다운로드합니다.
          </li>
          <li>양식을 작성한 뒤 파일을 저장합니다.</li>
          <li>아래 폼에서 작성한 파일을 첨부하고 제출하세요.</li>
        </ol>
      </div>

      <SubmitClient
        formTemplateId={template.id}
        defaultTitle={template.displayName}
        category={template.category}
      />
    </div>
  );
}
