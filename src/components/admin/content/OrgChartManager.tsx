"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrgChartMember } from "@/lib/types";

interface Props {
  members: OrgChartMember[];
}

interface OrgForm {
  name: string;
  title: string;
  department: string;
  team: string;
  order: number;
}

const EMPTY: OrgForm = {
  name: "",
  title: "국원",
  department: "행사기획국",
  team: "",
  order: 100,
};

const DEPT_SUGGESTIONS = ["회장단", "행사기획국", "사무국", "홍보디자인국", "동아리관리국"];
const TITLE_SUGGESTIONS = ["동아리연합회장", "동아리연합부회장", "국장", "팀장", "팀원", "국원"];

export default function OrgChartManager({ members }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<OrgForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
    setError("");
  }

  function openEdit(m: OrgChartMember) {
    setEditing(m.id);
    setForm({
      name: m.name,
      title: m.title,
      department: m.department,
      team: m.team || "",
      order: m.order,
    });
    setShowForm(true);
    setError("");
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setError("이름을 입력해주세요."); return; }
    if (!form.title.trim()) { setError("직책을 입력해주세요."); return; }
    if (!form.department.trim()) { setError("부서를 입력해주세요."); return; }
    setLoading(true);
    setError("");
    try {
      const url = editing ? `/api/orgchart/${editing}` : "/api/orgchart";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, team: form.team || undefined }),
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
    if (!confirm("구성원을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/orgchart/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "삭제 실패");
      return;
    }
    router.refresh();
  }

  const grouped: Record<string, OrgChartMember[]> = {};
  for (const m of members) {
    if (!grouped[m.department]) grouped[m.department] = [];
    grouped[m.department].push(m);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">조직도 관리</h1>
          <p className="text-sm text-gray-500 mt-1">동아리연합회 조직도의 구성원을 관리합니다.</p>
        </div>
        <button
          onClick={showForm ? () => setShowForm(false) : openCreate}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          {showForm ? "취소" : "+ 구성원 추가"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">직책</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              list="title-suggestions"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <datalist id="title-suggestions">
              {TITLE_SUGGESTIONS.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">부서</label>
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              list="dept-suggestions"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <datalist id="dept-suggestions">
              {DEPT_SUGGESTIONS.map((d) => <option key={d} value={d} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">팀 (선택)</label>
            <input
              value={form.team}
              onChange={(e) => setForm({ ...form, team: e.target.value })}
              placeholder="예: 디자인팀"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">정렬 순서 (낮을수록 위)</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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

      {members.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">👥</p>
          <p>등록된 구성원이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dept, depMembers]) => (
            <div key={dept} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
                {dept} <span className="text-xs text-gray-500 font-normal ml-2">{depMembers.length}명</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-2 font-medium text-gray-600">이름</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">직책</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">팀</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">순서</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {depMembers.map((m) => (
                    <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900">{m.name}</td>
                      <td className="px-4 py-2 text-gray-600">{m.title}</td>
                      <td className="px-4 py-2 text-gray-500">{m.team || "-"}</td>
                      <td className="px-4 py-2 text-gray-500">{m.order}</td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <button onClick={() => openEdit(m)} className="text-primary hover:underline text-sm">수정</button>
                        <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700 text-sm">삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
