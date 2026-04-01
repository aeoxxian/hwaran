"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import type { AppNotification } from "@/lib/types";

export default function NotificationBell() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!user || !isAdmin) return;
    let alive = true;

    async function poll() {
      try {
        const res = await fetch("/api/admin/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (alive) setNotifications(data.notifications || []);
      } catch { /* ignore */ }
    }

    poll();
    const interval = setInterval(poll, 30_000);
    return () => { alive = false; clearInterval(interval); };
  }, [user, isAdmin]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
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

  if (!user || !isAdmin) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="알림"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[1rem] h-4 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white px-0.5">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">알림</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                모두 읽음
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">알림이 없습니다.</div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {notifications.slice(0, 10).map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${n.isRead ? "" : "bg-amber-50/50"}`}
                  onClick={() => markRead(n.id)}
                >
                  <Link href={n.link} className="block" onClick={() => setOpen(false)}>
                    <p className={`text-sm ${n.isRead ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{n.message}</p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {new Date(n.createdAt).toLocaleString("ko-KR")}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="px-4 py-2 border-t border-gray-100 text-center">
            <Link href="/admin/notifications" className="text-xs text-primary hover:underline" onClick={() => setOpen(false)}>
              전체 알림 보기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
