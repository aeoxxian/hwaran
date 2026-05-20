"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_NAV, SITE_NAME } from "@/lib/constants";

const GROUP_ORDER = ["기본", "결재", "콘텐츠"] as const;

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout, adminLevel } = useAuth();

  const visibleNav = ADMIN_NAV.filter((item) => item.minLevel <= adminLevel);

  const grouped = new Map<string, typeof visibleNav>();
  for (const item of visibleNav) {
    const arr = grouped.get(item.group) || [];
    arr.push(item);
    grouped.set(item.group, arr);
  }

  return (
    <aside className="w-60 min-h-screen bg-dark text-white flex flex-col">
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/" className="text-xl font-bold text-primary">
          {SITE_NAME}
        </Link>
        <p className="text-xs text-white/50 mt-0.5">관리자 포털</p>
      </div>

      {user && (
        <div className="px-6 py-4 border-b border-white/10">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-white/50">
            {user.role === "국장팀장" ? "국장/팀장" : user.role}
          </p>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {GROUP_ORDER.map((groupName) => {
          const items = grouped.get(groupName);
          if (!items || items.length === 0) return null;
          return (
            <div key={groupName}>
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-3 mb-1.5">
                {groupName}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive = isAdminNavActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-primary text-white font-medium"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <NavIcon label={item.label} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="text-sm text-white/50 hover:text-white transition-colors w-full text-left"
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}

function NavIcon({ label }: { label: string }) {
  const icons: Record<string, string> = {
    대시보드: "⊞",
    "기안 목록": "📋",
    "기안 작성": "✏️",
    "서류신청 관리": "📁",
    "커뮤니티 관리": "🛡️",
    "공지 작성": "📢",
    "자료실 관리": "📄",
    "물품 관리": "📦",
    "캘린더 관리": "📅",
    "갤러리 관리": "🖼️",
    "동아리 관리": "🎯",
    "조직도 관리": "👥",
    알림: "🔔",
  };
  return <span className="text-base">{icons[label] ?? "·"}</span>;
}

function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/drafts/new") return pathname === "/admin/drafts/new";
  if (href === "/admin/drafts") {
    return pathname === "/admin/drafts" || /^\/admin\/drafts\/[^/]+$/.test(pathname);
  }
  if (href === "/admin/applications") {
    return pathname === "/admin/applications" || /^\/admin\/applications\/[^/]+$/.test(pathname);
  }
  if (href === "/admin/boards") {
    return pathname === "/admin/boards";
  }
  if (href.startsWith("/admin/content/")) {
    return pathname.startsWith(href);
  }
  return pathname === href;
}
