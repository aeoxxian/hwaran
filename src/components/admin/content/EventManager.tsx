"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CalendarEvent } from "@/lib/types";

interface Props {
  events: CalendarEvent[];
}

interface EventForm {
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  clubName: string;
  color: string;
}

const EMPTY: EventForm = {
  title: "",
  startDate: "",
  endDate: "",
  location: "",
  description: "",
  clubName: "",
  color: "#E05252",
};

export default function EventManager({ events }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
    setError("");
  }

  function openEdit(ev: CalendarEvent) {
    setEditing(ev.id);
    setForm({
      title: ev.title,
      startDate: ev.startDate,
      endDate: ev.endDate || ev.startDate,
      location: ev.location || "",
      description: ev.description || "",
      clubName: ev.clubName || "",
      color: ev.color || "#E05252",
    });
    setShowForm(true);
    setError("");
  }

  async function handleSubmit() {
    if (!form.title.trim()) { setError("제목을 입력해주세요."); return; }
    if (!form.startDate) { setError("시작일을 선택해주세요."); return; }
    setLoading(true);
    setError("");
    try {
      const url = editing ? `/api/events/${editing}` : "/api/events";
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
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "삭제 실패");
      return;
    }
    router.refresh();
  }

  const sorted = [...events].sort((a, b) => (a.startDate < b.startDate ? 1 : -1));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">캘린더 관리</h1>
          <p className="text-sm text-gray-500 mt-1">사이트 캘린더에 표시되는 일정을 관리합니다.</p>
        </div>
        <button
          onClick={showForm ? () => setShowForm(false) : openCreate}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          {showForm ? "취소" : "+ 일정 추가"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">장소</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">동아리명 (선택)</label>
            <input
              value={form.clubName}
              onChange={(e) => setForm({ ...form, clubName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">색상</label>
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="h-10 w-20 border border-gray-300 rounded"
            />
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
              <th className="text-left px-4 py-3 font-medium text-gray-600">제목</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">기간</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">장소</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">동아리</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">관리</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">등록된 일정이 없습니다.</td></tr>
            ) : sorted.map((ev) => (
              <tr key={ev.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: ev.color || "#E05252" }} />
                  {ev.title}
                </td>
                <td className="px-4 py-3 text-gray-600">{ev.startDate}{ev.endDate && ev.endDate !== ev.startDate ? ` ~ ${ev.endDate}` : ""}</td>
                <td className="px-4 py-3 text-gray-500">{ev.location || "-"}</td>
                <td className="px-4 py-3 text-gray-500">{ev.clubName || "-"}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(ev)} className="text-primary hover:underline text-sm">수정</button>
                  <button onClick={() => handleDelete(ev.id)} className="text-red-500 hover:text-red-700 text-sm">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
