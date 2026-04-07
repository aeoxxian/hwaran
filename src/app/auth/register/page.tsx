"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SITE_NAME, SITE_FULL_NAME } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import type { Club } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", passwordConfirm: "", clubId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    fetch("/api/clubs")
      .then((res) => res.json())
      .then((data) => setClubs(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (form.password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    const result = await register(form.name, form.email, form.password, form.clubId || undefined);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="화란 로고" width={80} height={80} className="mx-auto rounded-lg" />
          <h1 className="text-2xl font-bold text-dark mt-4">{SITE_NAME}</h1>
          <p className="text-gray-text text-sm mt-1">{SITE_FULL_NAME}</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-dark mb-6 text-center">회원가입</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark mb-1">이름</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="이름을 입력하세요"
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark mb-1">이메일</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="example@kentech.ac.kr"
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark mb-1">비밀번호</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="6자 이상"
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-dark mb-1">비밀번호 확인</label>
              <input
                id="passwordConfirm"
                type="password"
                value={form.passwordConfirm}
                onChange={(e) => updateField("passwordConfirm", e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="club" className="block text-sm font-medium text-dark mb-1">소속 동아리 (선택)</label>
              <select
                id="club"
                value={form.clubId}
                onChange={(e) => updateField("clubId", e.target.value)}
                className="input-field"
              >
                <option value="">선택 안함</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? "가입 중..." : "회원가입"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-text">
            이미 계정이 있으신가요?{" "}
            <Link href="/auth/login" className="text-primary hover:text-primary-dark font-medium">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
