import type { Metadata } from "next";
import Link from "next/link";
import { groupFormsByCategory, type FormFileType } from "@/lib/forms-catalog";
import DownloadButton from "@/components/forms/DownloadButton";

export const metadata: Metadata = {
  title: "서류 양식",
  description: "동아리 운영에 필요한 공식 양식을 다운로드하세요.",
};

const FILE_TYPE_BADGE: Record<FormFileType, string> = {
  docx: "bg-blue-50 text-blue-700",
  xlsx: "bg-green-50 text-green-700",
  pdf: "bg-red-50 text-red-700",
};

function DownloadIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

export default function FormsPage() {
  const groups = groupFormsByCategory();
  const totalCount = groups.reduce((acc, g) => acc + g.forms.length, 0);

  return (
    <div className="container-page">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-dark">서류 양식</h1>
        <p className="section-subtitle">
          동아리 운영에 필요한 공식 양식을 다운로드하세요
        </p>
        <p className="mt-2 text-sm text-gray-text">
          총 {totalCount}개 양식 · {groups.length}개 분류
        </p>
      </div>

      <div className="space-y-12">
        {groups.map((group) => (
          <section key={group.category} aria-labelledby={`cat-${group.category}`}>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2
                  id={`cat-${group.category}`}
                  className="section-title flex items-center gap-2"
                >
                  <span className="inline-block h-5 w-1 rounded bg-primary" />
                  {group.category}
                </h2>
                <p className="section-subtitle text-sm">{group.description}</p>
              </div>
              <span className="badge bg-gray-light text-gray-text">
                {group.forms.length}개
              </span>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.forms.map((form) => (
                <li key={form.id} className="card flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`badge ${FILE_TYPE_BADGE[form.fileType]} uppercase`}
                    >
                      {form.fileType}
                    </span>
                  </div>
                  <h3 className="mt-3 font-semibold text-dark leading-snug">
                    {form.displayName}
                  </h3>
                  {form.description && (
                    <p className="mt-1 text-sm text-gray-text leading-relaxed">
                      {form.description}
                    </p>
                  )}
                  <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                    <DownloadButton
                      formId={form.id}
                      filename={`${form.displayName}.${form.fileType}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors disabled:opacity-50"
                    >
                      <DownloadIcon />
                      다운로드
                    </DownloadButton>
                    <Link
                      href={`/forms/${form.id}/submit`}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-white hover:bg-primary-dark transition-colors"
                    >
                      제출하기
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-gray-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-dark">안내</h2>
        <ul className="mt-3 space-y-1 text-sm text-gray-text leading-relaxed list-disc list-inside">
          <li>모든 양식은 화란 동아리연합회가 배포하는 공식 문서입니다.</li>
          <li>
            파일 형식은 한글(.docx), 엑셀(.xlsx), PDF(.pdf) 중 하나이며 분류별로
            정리되어 있습니다.
          </li>
          <li>
            제출 절차 및 마감일은 별도 공지를 확인하거나 담당 부서로 문의해
            주세요.
          </li>
        </ul>
      </div>
    </div>
  );
}
