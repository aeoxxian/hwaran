"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AppNotification } from "@/lib/types";

const KIND_STYLE: Record<string, string> = {
  기안: "bg-blue-50 text-blue-600",
  서류신청: "bg-purple-50 text-purple-600",
  공지: "bg-amber-50 text-amber-600",
  기타: "bg-gray-100 text-gray-500",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  async function markAllRead() {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">알림</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unread > 0 ? `미읽음 ${unread}건이 있습니다.` : "모두 읽었습니다."}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-primary border border-primary rounded-lg px-3 py-1.5 hover:bg-primary hover:text-white transition-colors"
          >
            모두 읽음 처리
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">불러오는 중...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔔</p>
          <p>알림이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${n.isRead ? "" : "bg-amber-50/30"}`}
              onClick={() => markRead(n.id)}
            >
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-0.5 ${KIND_STYLE[n.kind] ?? KIND_STYLE.기타}`}>
                {n.kind}
              </span>
              <div className="flex-1 min-w-0">
                <Link href={n.link} className="block">
                  <p className={`text-sm ${n.isRead ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-300 mt-1">
                    {new Date(n.createdAt).toLocaleString("ko-KR")}
                  </p>
                </Link>
              </div>
              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
