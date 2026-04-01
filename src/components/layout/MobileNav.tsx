"use client";

import Link from "next/link";
import { useState } from "react";
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-80 max-w-full bg-dark shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-lg font-bold text-white">{SITE_NAME}</span>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white" aria-label="메뉴 닫기">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_ITEMS.map((item) => (
            <div key={item.label}>
              {"children" in item && item.children ? (
                <>
                  <button
                    onClick={() => setExpandedItem(expandedItem === item.label ? null : item.label)}
                    className="w-full flex items-center justify-between px-6 py-3 text-gray-300 hover:text-white hover:bg-white/5"
                  >
                    <span className="font-medium">{item.label}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedItem === item.label ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedItem === item.label && (
                    <div className="bg-white/5">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={onClose}
                          className="block px-10 py-2.5 text-sm text-gray-400 hover:text-white"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block px-6 py-3 font-medium text-gray-300 hover:text-white hover:bg-white/5"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/auth/login" onClick={onClose} className="block w-full text-center py-2.5 text-gray-300 hover:text-white border border-white/20 rounded-lg">
            로그인
          </Link>
          <Link href="/auth/register" onClick={onClose} className="block w-full text-center py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
