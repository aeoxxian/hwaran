"use client";

import { useEffect, useState } from "react";

interface StatusResponse {
  mode: "mock" | "notion-live";
  notion: boolean;
  jwt: boolean;
  storage: { configured: boolean };
  email: { configured: boolean };
  databases: Record<string, boolean>;
  summary: { configuredDatabases: number; totalDatabases: number };
}

const DB_LABELS: Record<string, string> = {
  members: "회원",
  notices: "공지사항",
  clubs: "동아리",
  clubMembers: "동아리 구성원",
  events: "일정",
  qna: "QnA",
  complaints: "민원",
  lostFound: "분실물",
  promotions: "동아리 홍보",
  gallery: "갤러리",
  documents: "자료실",
  inventory: "물품",
  banners: "배너",
  boardComments: "게시판 댓글",
  drafts: "기안",
  applications: "서류신청",
  notifications: "알림",
};

export default function RuntimeStatusCard() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  if (!status) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-400">
        운영 상태를 확인하는 중입니다...
      </div>
    );
  }

  const isLive = status.mode === "notion-live";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider border rounded-full px-2 py-0.5 ${
              isLive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-amber-500"}`} />
            {isLive ? "NOTION LIVE" : "MOCK"}
          </span>
          <span className="text-sm text-gray-700">
            DB {status.summary.configuredDatabases}/{status.summary.totalDatabases} · Notion {status.notion ? "OK" : "OFF"}
          </span>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs text-primary hover:underline"
        >
          {open ? "닫기" : "자세히"}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <StatusPill label="Notion API" ok={status.notion} />
            <StatusPill label="JWT Secret" ok={status.jwt} />
            <StatusPill label="S3 Storage" ok={status.storage.configured} />
            <StatusPill label="SMTP Email" ok={status.email.configured} />
          </div>
          <div>
            <p className="text-gray-500 mb-1.5 font-medium">데이터베이스</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {Object.entries(status.databases).map(([key, ok]) => (
                <span
                  key={key}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-[11px] ${
                    ok
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-gray-50 text-gray-500 border-gray-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-gray-400"}`} />
                  {DB_LABELS[key] || key}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border ${
        ok
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-gray-50 text-gray-500 border-gray-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-gray-400"}`} />
      {label}
    </span>
  );
}
