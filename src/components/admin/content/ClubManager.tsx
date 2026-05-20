"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Club } from "@/lib/types";

interface Props {
  clubs: Club[];
  categories: string[];
}

interface ClubForm {
  name: string;
  description: string;
  category: string;
  instagramUrl: string;
  memberCount: number;
  logo: string;
  bannerImage: string;
}

const EMPTY: ClubForm = {
  name: "",
  description: "",
  category: "학술",
  instagramUrl: "",
  memberCount: 0,
  logo: "",
  bannerImage: "",
};

export default function ClubManager({ clubs, categories }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ClubForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const cleanedCategories = categories.filter((c) => c !== "전체");

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY, category: cleanedCategories[0] || "학술" });
    setShowForm(true);
    setError("");
  }

  function openEdit(club: Club) {
    setEditing(club.id);
    setForm({
      name: club.name,
      description: club.description,
      category: club.category,
      instagramUrl: club.instagramUrl || "",
      memberCount: club.memberCount,
      logo: club.logo || "",
      bannerImage: club.bannerImage || "",
    });
    setShowForm(true);
    setError("");
  }

  async function uploadOne(file: File): Promise<string> {
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type, folder: "clubs" }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "업로드 실패");
    }
    const { uploadUrl, fileUrl } = await res.json();
    await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
    return fileUrl;
  }

  async function handleLogoUpload(file: File | null) {
    if (!file) return;
    try {
      const url = await uploadOne(file);
      setForm((f) => ({ ...f, logo: url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "로고 업로드 실패");
    }
  }

  async function handleBannerUpload(file: File | null) {
    if (!file) return;
    try {
      const url = await uploadOne(file);
      setForm((f) => ({ ...f, bannerImage: url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "배너 업로드 실패");
    }
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setError("동아리명을 입력해주세요."); return; }
    if (!form.description.trim()) { setError("소개를 입력해주세요."); return; }
    setLoading(true);
    setError("");
    try {
      const url = editing ? `/api/clubs/${editing}` : "/api/clubs";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "저장 실패");
      }
      setShowForm(false);
      setEditing(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("동아리를 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/clubs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "삭제 실패");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">동아리 관리</h1>
          <p className="text-sm text-gray-500 mt-1">동아리 정보를 추가·수정·삭제합니다.</p>
        </div>
        <button
          onClick={showForm ? () => setShowForm(false) : openCreate}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          {showForm ? "취소" : "+ 동아리 추가"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">동아리명</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">분류</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {cleanedCategories.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">소개</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">인스타그램 URL</label>
            <input
              value={form.instagramUrl}
              onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">회원수</label>
            <input
              type="number"
              min={0}
              value={form.memberCount}
              onChange={(e) => setForm({ ...form, memberCount: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">로고</label>
            <div className="flex items-center gap-2">
              {form.logo && (
                <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                  <Image src={form.logo} alt="로고" fill className="object-cover" sizes="48px" />
                </div>
              )}
              <button
                onClick={() => logoRef.current?.click()}
                className="text-sm text-primary hover:underline"
              >
                {form.logo ? "변경" : "업로드"}
              </button>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleLogoUpload(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">배너 이미지</label>
            <div className="flex items-center gap-2">
              {form.bannerImage && (
                <div className="relative w-20 h-12 rounded overflow-hidden bg-gray-100">
                  <Image src={form.bannerImage} alt="배너" fill className="object-cover" sizes="80px" />
                </div>
              )}
              <button
                onClick={() => bannerRef.current?.click()}
                className="text-sm text-primary hover:underline"
              >
                {form.bannerImage ? "변경" : "업로드"}
              </button>
              <input
                ref={bannerRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleBannerUpload(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}
          <div className="md:col-span-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "저장 중..." : editing ? "수정" : "등록"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">동아리명</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">분류</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">회원수</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">인스타그램</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">관리</th>
            </tr>
          </thead>
          <tbody>
            {clubs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">등록된 동아리가 없습니다.</td></tr>
            ) : clubs.map((club) => (
              <tr key={club.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{club.name}</td>
                <td className="px-4 py-3 text-gray-600">{club.category}</td>
                <td className="px-4 py-3 text-gray-600">{club.memberCount}명</td>
                <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">
                  {club.instagramUrl ? (
                    <a href={club.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      방문
                    </a>
                  ) : "-"}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(club)} className="text-primary hover:underline text-sm">수정</button>
                  <button onClick={() => handleDelete(club.id)} className="text-red-500 hover:text-red-700 text-sm">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
