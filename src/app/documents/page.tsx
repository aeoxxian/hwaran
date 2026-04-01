"use client";

import { useState } from "react";
import { mockDocuments } from "@/lib/mock-data";

const categories = ["전체", "회칙", "양식", "회의록", "기타"];

export default function DocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const filtered = selectedCategory === "전체"
    ? mockDocuments
    : mockDocuments.filter((d) => d.category === selectedCategory);

  return (
    <div className="container-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">자료실</h1>
        <p className="section-subtitle">회칙, 양식, 회의록 등 내부 자료를 확인하세요</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-primary text-white"
                : "bg-gray-light text-gray-text hover:bg-primary-50 hover:text-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-gray-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-light">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-text uppercase tracking-wider">분류</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-text uppercase tracking-wider">제목</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-text uppercase tracking-wider hidden sm:table-cell">등록일</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-text uppercase tracking-wider">다운로드</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-border">
            {filtered.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-light/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="badge-primary">{doc.category}</span>
                </td>
                <td className="px-6 py-4 font-medium text-dark">{doc.title}</td>
                <td className="px-6 py-4 text-sm text-gray-text hidden sm:table-cell">{doc.createdAt}</td>
                <td className="px-6 py-4 text-right">
                  <a href={doc.fileUrl} className="inline-flex items-center gap-1 text-primary hover:text-primary-dark transition-colors text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    다운로드
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
