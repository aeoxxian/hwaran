import type { UserRole } from "./types";

export const SITE_NAME = "화란";
export const SITE_FULL_NAME = "한국에너지공과대학교 동아리연합회";
export const SITE_GENERATION = "제4대";
export const SITE_DESCRIPTION = "한국에너지공과대학교(KENTECH) 제4대 동아리연합회 화란 공식 웹사이트";

export const NAV_ITEMS = [
  { label: "소개", href: "/about" },
  { label: "공지사항", href: "/notices" },
  { label: "동아리 소개", href: "/clubs" },
  { label: "캘린더", href: "/calendar" },
  {
    label: "커뮤니티",
    href: "/boards",
    children: [
      { label: "문의 게시판", href: "/boards/qna" },
      { label: "민원 게시판", href: "/boards/complaints" },
      { label: "분실물 게시판", href: "/boards/lost-found" },
      { label: "동아리 홍보글", href: "/boards/promotions" },
    ],
  },
  { label: "갤러리", href: "/gallery" },
  { label: "자료실", href: "/documents" },
  { label: "물품 관리", href: "/inventory" },
] as const;

export const CONTACT_INFO = {
  address: "경상북도 나주시 한국에너지공과대학교",
  phone: "000-0000-0000",
  email: "hwaran@kentech.ac.kr",
  instagram: "https://instagram.com/hwaran_kentech",
};

// ─── 관리자 역할 상수 ──────────────────────────────────────────

export const ADMIN_ROLE_LABELS: Record<string, string> = {
  회장단: "회장단",
  국장팀장: "국장/팀장",
  국원: "국원",
};

/** 관리자 사이드바 메뉴 (역할별 접근 제어용 minLevel 포함) */
export const ADMIN_NAV = [
  { label: "대시보드", href: "/admin", minLevel: 1 },
  { label: "기안 목록", href: "/admin/drafts", minLevel: 1 },
  { label: "기안 작성", href: "/admin/drafts/new", minLevel: 1 },
  { label: "서류신청 관리", href: "/admin/applications", minLevel: 2 },
  { label: "커뮤니티 관리", href: "/admin/boards", minLevel: 2 },
  { label: "공지 작성", href: "/admin/notices/new", minLevel: 2 },
  { label: "알림", href: "/admin/notifications", minLevel: 1 },
] as const;

export const DRAFT_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "예산", label: "예산 관련" },
  { value: "동아리등록", label: "동아리 등록" },
  { value: "물품사용", label: "물품 사용 신청" },
  { value: "기타", label: "기타" },
];

/** 기안 상태별 UI 색상 클래스 */
export const DRAFT_STATUS_CLASS: Record<string, string> = {
  임시저장: "bg-gray-100 text-gray-600",
  "1차검토중": "bg-amber-50 text-amber-700",
  최종검토중: "bg-blue-50 text-blue-700",
  승인: "bg-green-50 text-green-700",
  반려: "bg-red-50 text-red-600",
};

/** 역할 레벨 → 다음 결재자 역할 */
export const NEXT_REVIEWER: Partial<Record<UserRole, UserRole>> = {
  국원: "국장팀장",
  국장팀장: "회장단",
};

/** 역할 레벨 → 기안 제출 시 도달 상태 */
export const SUBMIT_STATUS: Partial<Record<UserRole, string>> = {
  국원: "1차검토중",
  국장팀장: "최종검토중",
  회장단: "최종검토중",
  관리자: "최종검토중",
};
