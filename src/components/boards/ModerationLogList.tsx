"use client";

import { useEffect, useState } from "react";
import type { ModerationLog } from "@/lib/types";

const ACTION_LABEL: Record<string, string> = {
  approve: "승인",
  reject: "반려",
  resolve: "해결",
  pending: "대기",
};

const ACTION_TONE: Record<string, string> = {
  approve: "bg-emerald-50 text-emerald-700 border-emerald-200",
  reject: "bg-rose-50 text-rose-700 border-rose-200",
  resolve: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function ModerationLogList({ postId }: { postId: string }) {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/boards/${postId}/moderation`)
      .then((r) => {
        if (r.status === 401 || r.status === 403) {
          setAllowed(false);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setLogs(d.logs || []);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [postId]);

  if (!allowed) return null;
  if (loading) return null;
  if (logs.length === 0) return null;

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-dark mb-3">모더레이션 이력</h3>
      <ul className="space-y-2">
        {logs.map((log) => (
          <li key={log.id} className="border border-gray-border rounded-lg p-3 text-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span
                className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider border rounded-full px-2 py-0.5 ${
                  ACTION_TONE[log.action] || "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                {ACTION_LABEL[log.action] || log.action} · {log.status}
              </span>
              <span className="text-xs text-gray-text">
                {new Date(log.createdAt).toLocaleString("ko-KR")}
              </span>
            </div>
            <div className="text-xs text-gray-text mb-1">
              {log.actorName} ({log.actorRole})
            </div>
            {log.note && <p className="text-sm text-dark whitespace-pre-wrap">{log.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
