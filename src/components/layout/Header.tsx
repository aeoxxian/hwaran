"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";
import MobileNav from "./MobileNav";
import NotificationBell from "@/components/admin/NotificationBell";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-dark text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image src="/logo.png" alt="화란 로고" width={40} height={40} className="rounded-full" />
            <span className="text-xl font-bold tracking-tight">{SITE_NAME}</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => "children" in item ? setDropdownOpen(item.label) : undefined}
                onMouseLeave={() => setDropdownOpen(null)}
              >
                <Link
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {item.label}
                </Link>
                {"children" in item && item.children && dropdownOpen === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-dark-light rounded-lg shadow-xl border border-white/10 py-2 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <NotificationBell />
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="px-3 py-2 text-sm font-medium text-amber-300 hover:text-white transition-colors">
                    관리자
                  </Link>
                )}
                <span className="text-sm text-gray-300">{user.name}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  로그인
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm !px-4 !py-2">
                  회원가입
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10"
            aria-label="메뉴 열기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
