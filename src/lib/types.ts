// ─── 사용자 역할 ────────────────────────────────────────────
export type UserRole =
  | "회장단"       // 관리자 레벨 3 (최종 결재)
  | "국장팀장"     // 관리자 레벨 2 (1차 결재)
  | "국원"         // 관리자 레벨 1 (기안 작성)
  /** 초기 Notion DB 스크립트에서 쓰던 값 — 회장단과 동일 권한으로 취급 */
  | "관리자"
  | "동아리장"
  | "부동아리장"
  | "회원";

export const ADMIN_ROLES: UserRole[] = ["회장단", "국장팀장", "국원", "관리자"];

export function getAdminLevel(role: UserRole): number {
  if (role === "회장단" || role === "관리자") return 3;
  if (role === "국장팀장") return 2;
  if (role === "국원") return 1;
  return 0;
}

export function isAdmin(role: UserRole): boolean {
  return getAdminLevel(role) > 0;
}

/** Notion에 '회장단'만 있고 계정은 '관리자'인 경우 등, 최종 결재 역할 호환 */
export function roleMatchesReviewer(userRole: UserRole, reviewerRole: UserRole | undefined): boolean {
  if (!reviewerRole) return false;
  if (userRole === reviewerRole) return true;
  const top: UserRole[] = ["회장단", "관리자"];
  return top.includes(userRole) && top.includes(reviewerRole);
}

// ─── 기존 인터페이스 ──────────────────────────────────────────

export interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  isPinned: boolean;
  attachments?: string[];
}

export interface Club {
  id: string;
  name: string;
  description: string;
  logo?: string;
  bannerImage?: string;
  instagramUrl?: string;
  category: string;
  memberCount: number;
}

export interface ClubMember {
  id: string;
  name: string;
  role: "회장" | "부회장" | "회원";
  introduction?: string;
  profileImage?: string;
  clubId: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  clubId?: string;
  clubName?: string;
  location?: string;
  description?: string;
  color?: string;
}

export interface BoardPost {
  id: string;
  title: string;
  content: string;
  authorId?: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
  category: "qna" | "complaints" | "lost-found" | "promotions";
  status?: "대기" | "답변완료" | "해결" | "미해결";
  visibility?: "public" | "internal";
  approvalStatus?: "pending" | "approved" | "rejected";
  isAnonymous?: boolean;
  images?: string[];
  attachments?: string[];
  reply?: string;
  replyDate?: string;
  clubId?: string;
  clubName?: string;
  location?: string;
  comments?: BoardComment[];
}

export interface BoardComment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole?: UserRole;
  createdAt: string;
  isAdminComment?: boolean;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  date: string;
  description: string;
  coverImage: string;
  images: string[];
  clubId?: string;
  clubName?: string;
}

export interface Document {
  id: string;
  title: string;
  category: "회칙" | "양식" | "회의록" | "기타";
  fileUrl: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  status: "사용가능" | "대여중" | "수리중" | "폐기";
  location: string;
  note?: string;
}

export interface Banner {
  id: string;
  clubId: string;
  clubName: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
}

export interface ExternalChannel {
  id: string;
  name: string;
  platform: "instagram" | "youtube" | "website" | "other";
  url: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  clubId?: string;
  clubName?: string;
  role: UserRole;
}

// ─── 관리자 포털 전용 ──────────────────────────────────────────

export type DraftStatus =
  | "임시저장"
  | "1차검토중"
  | "최종검토중"
  | "승인"
  | "반려";

export type DraftType = "예산" | "동아리등록" | "물품사용" | "기타";

export type ApplicationStatus =
  | "대기"
  | "1차검토중"
  | "최종검토중"
  | "승인"
  | "반려";

export type ApplicationType = "예산" | "동아리등록" | "물품사용" | "기타";

export interface DraftComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  action: "검토의견" | "승인" | "반려" | "수정요청";
  createdAt: string;
}

export interface Draft {
  id: string;
  title: string;
  content: string;
  type: DraftType;
  status: DraftStatus;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  currentReviewerRole?: UserRole;
  attachments: string[];
  comments: DraftComment[];
  createdAt: string;
  updatedAt: string;
}

export interface ClubApplication {
  id: string;
  title: string;
  type: ApplicationType;
  clubName: string;
  submitterName: string;
  submittedAt: string;
  status: ApplicationStatus;
  attachments: string[];
  reviewComment?: string;
  reviewedAt?: string;
  reviewerName?: string;
}

export type NotificationKind = "기안" | "서류신청" | "공지" | "기타";

export interface AppNotification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
  kind: NotificationKind;
}
