/**
 * 서버사이드 데이터 레이어
 *
 * API Route와 서버 컴포넌트 모두 이 파일의 함수를 사용합니다.
 * Notion API 키가 있으면 실제 DB를 쿼리하고, 없으면 mock 데이터를 반환합니다.
 */

import notion, { databaseIds, getTextProperty, getFilesProperty } from "./notion";
import {
  mockNotices, mockClubs, mockClubMembers, mockEvents,
  mockBoardPosts, mockGalleryAlbums, mockDocuments,
  mockInventory, mockBanners, mockExternalChannels,
  mockDrafts, mockApplications, mockNotifications,
} from "./mock-data";
import type {
  Notice, Club, ClubMember, CalendarEvent, BoardPost,
  GalleryAlbum, Document, InventoryItem, Banner, ExternalChannel,
  Draft, ClubApplication, AppNotification, DraftComment, UserRole,
} from "./types";

const USE_MOCK = !process.env.NOTION_API_KEY;

// ─── 유틸 ──────────────────────────────────────────────────

/** Notion 커서 기반 전체 페이지 조회 */
async function queryAllPages(
  dbId: string,
  options?: {
    sorts?: Parameters<typeof notion.databases.query>[0]["sorts"];
    filter?: Parameters<typeof notion.databases.query>[0]["filter"];
    pageSize?: number;
  },
) {
  const results: Record<string, unknown>[] = [];
  let cursor: string | undefined;

  do {
    const res = await notion.databases.query({
      database_id: dbId,
      start_cursor: cursor,
      page_size: options?.pageSize ?? 100,
      sorts: options?.sorts,
      filter: options?.filter,
    });
    results.push(...(res.results as Record<string, unknown>[]));
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);

  return results;
}

// ─── 공지사항 ──────────────────────────────────────────────

export async function getNotices(): Promise<Notice[]> {
  if (USE_MOCK || !databaseIds.notices) return mockNotices;

  try {
    const pages = await queryAllPages(databaseIds.notices, {
      sorts: [{ property: "작성일", direction: "descending" }],
    });

    return pages.map((p) => ({
      id: p.id as string,
      title: getTextProperty(p, "제목"),
      content: getTextProperty(p, "내용"),
      author: getTextProperty(p, "작성자"),
      createdAt: getTextProperty(p, "작성일"),
      isPinned: getTextProperty(p, "중요여부") === "true",
      attachments: getFilesProperty(p, "첨부파일"),
    }));
  } catch (error) {
    console.error("Failed to fetch notices:", error);
    return mockNotices;
  }
}

// ─── 동아리 ──────────────────────────────────────────────

function mapNotionToClub(p: Record<string, unknown>): Club {
  return {
    id: p.id as string,
    name: getTextProperty(p, "이름"),
    description: getTextProperty(p, "소개"),
    logo: getFilesProperty(p, "로고")[0],
    bannerImage: getFilesProperty(p, "배너이미지")[0],
    instagramUrl: getTextProperty(p, "인스타그램"),
    category: getTextProperty(p, "분류"),
    memberCount: parseInt(getTextProperty(p, "회원수")) || 0,
  };
}

export async function getClubs(): Promise<Club[]> {
  if (USE_MOCK || !databaseIds.clubs) return mockClubs;

  try {
    const pages = await queryAllPages(databaseIds.clubs);
    return pages.map(mapNotionToClub);
  } catch (error) {
    console.error("Failed to fetch clubs:", error);
    return mockClubs;
  }
}

export async function getClubById(id: string): Promise<{ club: Club | null; members: ClubMember[] }> {
  if (USE_MOCK || !databaseIds.clubs) {
    const club = mockClubs.find((c) => c.id === id) || null;
    const members = mockClubMembers.filter((m) => m.clubId === id);
    return { club, members };
  }

  try {
    const page = await notion.pages.retrieve({ page_id: id });
    const club = mapNotionToClub(page as Record<string, unknown>);

    let members: ClubMember[] = [];
    if (databaseIds.clubMembers) {
      const memberPages = await queryAllPages(databaseIds.clubMembers, {
        filter: { property: "동아리ID", rich_text: { equals: id } },
      });
      members = memberPages.map((m) => ({
        id: m.id as string,
        name: getTextProperty(m, "이름"),
        role: getTextProperty(m, "역할") as ClubMember["role"],
        introduction: getTextProperty(m, "소개"),
        profileImage: getFilesProperty(m, "프로필사진")[0],
        clubId: id,
      }));
    }

    return { club, members };
  } catch (error) {
    console.error("Failed to fetch club:", error);
    return { club: null, members: [] };
  }
}

// ─── 일정 ──────────────────────────────────────────────

export async function getEvents(): Promise<CalendarEvent[]> {
  if (USE_MOCK || !databaseIds.events) return mockEvents;

  try {
    const pages = await queryAllPages(databaseIds.events, {
      sorts: [{ property: "시작일", direction: "ascending" }],
    });

    return pages.map((p) => ({
      id: p.id as string,
      title: getTextProperty(p, "제목"),
      startDate: getTextProperty(p, "시작일"),
      endDate: getTextProperty(p, "종료일") || getTextProperty(p, "시작일"),
      clubId: getTextProperty(p, "동아리ID") || undefined,
      clubName: getTextProperty(p, "동아리명") || undefined,
      location: getTextProperty(p, "장소") || undefined,
      description: getTextProperty(p, "설명") || undefined,
      color: getTextProperty(p, "색상") || undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return mockEvents;
  }
}

// ─── 게시판 ──────────────────────────────────────────────

type BoardCategory = BoardPost["category"];

function getDbIdForCategory(category: string): string {
  switch (category) {
    case "qna": return databaseIds.qna;
    case "complaints": return databaseIds.complaints;
    case "lost-found": return databaseIds.lostFound;
    case "promotions": return databaseIds.promotions;
    default: return "";
  }
}

function mapNotionToBoardPost(page: Record<string, unknown>, category: BoardCategory): BoardPost {
  const author = getTextProperty(page, "작성자");
  return {
    id: page.id as string,
    title: getTextProperty(page, "제목"),
    content: getTextProperty(page, "내용") || getTextProperty(page, "설명"),
    authorId: getTextProperty(page, "작성자ID") || undefined,
    author: author || "익명",
    createdAt: getTextProperty(page, "작성일"),
    updatedAt: getTextProperty(page, "수정일") || undefined,
    category,
    status: (getTextProperty(page, "상태") || "대기") as BoardPost["status"],
    visibility: (getTextProperty(page, "공개범위") as BoardPost["visibility"]) || "public",
    approvalStatus: (getTextProperty(page, "승인상태") as BoardPost["approvalStatus"]) || "approved",
    isAnonymous: getTextProperty(page, "익명여부") === "true",
    images: getFilesProperty(page, "이미지"),
    attachments: getFilesProperty(page, "첨부파일"),
    reply: getTextProperty(page, "답변") || undefined,
    replyDate: getTextProperty(page, "답변일") || undefined,
    clubId: getTextProperty(page, "동아리ID") || undefined,
    clubName: getTextProperty(page, "동아리명") || undefined,
    location: getTextProperty(page, "장소") || undefined,
  };
}

export async function getBoardPosts(
  category: BoardCategory,
  options?: { search?: string; status?: string; page?: number; pageSize?: number },
): Promise<{ posts: BoardPost[]; total: number }> {
  const { search = "", status = "", page = 1, pageSize = 20 } = options || {};
  const dbId = getDbIdForCategory(category);

  if (USE_MOCK || !dbId) {
    let posts = mockBoardPosts.filter((p) => p.category === category);
    if (status) posts = posts.filter((p) => p.status === status);
    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }
    const offset = (page - 1) * pageSize;
    return { posts: posts.slice(offset, offset + pageSize), total: posts.length };
  }

  try {
    const pages = await queryAllPages(dbId, {
      sorts: [{ property: "작성일", direction: "descending" }],
    });

    let posts = pages.map((p) => mapNotionToBoardPost(p, category));
    if (status) posts = posts.filter((p) => p.status === status);
    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }
    const offset = (page - 1) * pageSize;
    return { posts: posts.slice(offset, offset + pageSize), total: posts.length };
  } catch (error) {
    console.error("Failed to fetch board posts:", error);
    const posts = mockBoardPosts.filter((p) => p.category === category);
    return { posts, total: posts.length };
  }
}

// ─── 갤러리 ──────────────────────────────────────────────

export async function getGalleryAlbums(): Promise<GalleryAlbum[]> {
  if (USE_MOCK || !databaseIds.gallery) return mockGalleryAlbums;

  try {
    const pages = await queryAllPages(databaseIds.gallery, {
      sorts: [{ property: "날짜", direction: "descending" }],
    });

    return pages.map((p) => ({
      id: p.id as string,
      title: getTextProperty(p, "행사명"),
      date: getTextProperty(p, "날짜"),
      description: getTextProperty(p, "설명"),
      coverImage: getFilesProperty(p, "이미지")[0] || "/images/gallery-placeholder.png",
      images: getFilesProperty(p, "이미지"),
      clubId: getTextProperty(p, "동아리ID") || undefined,
      clubName: getTextProperty(p, "동아리명") || undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch gallery:", error);
    return mockGalleryAlbums;
  }
}

// ─── 자료실 ──────────────────────────────────────────────

export async function getDocuments(): Promise<Document[]> {
  if (USE_MOCK || !databaseIds.documents) return mockDocuments;

  try {
    const pages = await queryAllPages(databaseIds.documents, {
      sorts: [{ property: "작성일", direction: "descending" }],
    });

    return pages.map((p) => ({
      id: p.id as string,
      title: getTextProperty(p, "제목"),
      category: getTextProperty(p, "분류") as Document["category"],
      fileUrl: getFilesProperty(p, "파일")[0] || "#",
      createdAt: getTextProperty(p, "작성일"),
    }));
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return mockDocuments;
  }
}

// ─── 물품 관리 ──────────────────────────────────────────────

export async function getInventory(): Promise<InventoryItem[]> {
  if (USE_MOCK || !databaseIds.inventory) return mockInventory;

  try {
    const pages = await queryAllPages(databaseIds.inventory);

    return pages.map((p) => ({
      id: p.id as string,
      name: getTextProperty(p, "이름"),
      quantity: parseInt(getTextProperty(p, "수량")) || 0,
      status: getTextProperty(p, "상태") as InventoryItem["status"],
      location: getTextProperty(p, "보관위치"),
      note: getTextProperty(p, "비고") || undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return mockInventory;
  }
}

// ─── 배너 ──────────────────────────────────────────────

export async function getBanners(): Promise<Banner[]> {
  if (USE_MOCK || !databaseIds.banners) return mockBanners;

  try {
    const pages = await queryAllPages(databaseIds.banners);

    return pages.map((p) => ({
      id: p.id as string,
      clubId: getTextProperty(p, "동아리ID"),
      clubName: getTextProperty(p, "동아리명"),
      imageUrl: getFilesProperty(p, "이미지")[0] || "/images/banner-placeholder.png",
      linkUrl: getTextProperty(p, "링크") || undefined,
      isActive: getTextProperty(p, "활성여부") === "true",
    })).filter((b) => b.isActive);
  } catch (error) {
    console.error("Failed to fetch banners:", error);
    return mockBanners;
  }
}

// ─── 외부 채널 (현재 Notion DB 없음 → 항상 mock) ──────────

export async function getExternalChannels(): Promise<ExternalChannel[]> {
  return mockExternalChannels;
}

// ─── 관리자: 기안 ──────────────────────────────────────────

export async function getDrafts(): Promise<Draft[]> {
  if (USE_MOCK || !databaseIds.drafts) return mockDrafts;

  try {
    const pages = await queryAllPages(databaseIds.drafts, {
      sorts: [{ property: "작성일", direction: "descending" }],
    });

    return pages.map((p) => ({
      id: p.id as string,
      title: getTextProperty(p, "제목"),
      content: getTextProperty(p, "내용"),
      type: getTextProperty(p, "유형") as Draft["type"],
      status: getTextProperty(p, "상태") as Draft["status"],
      authorId: getTextProperty(p, "작성자ID"),
      authorName: getTextProperty(p, "작성자명"),
      authorRole: getTextProperty(p, "작성자역할") as UserRole,
      currentReviewerRole: (getTextProperty(p, "현재결재자역할") as UserRole) || undefined,
      attachments: getFilesProperty(p, "첨부파일"),
      comments: [] as DraftComment[], // 댓글은 별도 조회 필요
      createdAt: getTextProperty(p, "작성일"),
      updatedAt: getTextProperty(p, "수정일"),
    }));
  } catch (error) {
    console.error("Failed to fetch drafts:", error);
    return mockDrafts;
  }
}

// ─── 관리자: 서류신청 ──────────────────────────────────────

export async function getApplications(): Promise<ClubApplication[]> {
  if (USE_MOCK || !databaseIds.applications) return mockApplications;

  try {
    const pages = await queryAllPages(databaseIds.applications, {
      sorts: [{ property: "제출일", direction: "descending" }],
    });

    return pages.map((p) => ({
      id: p.id as string,
      title: getTextProperty(p, "제목"),
      type: getTextProperty(p, "유형") as ClubApplication["type"],
      clubName: getTextProperty(p, "동아리명"),
      submitterName: getTextProperty(p, "제출자"),
      submittedAt: getTextProperty(p, "제출일"),
      status: getTextProperty(p, "상태") as ClubApplication["status"],
      attachments: getFilesProperty(p, "첨부파일"),
      reviewComment: getTextProperty(p, "검토의견") || undefined,
      reviewedAt: getTextProperty(p, "검토일") || undefined,
      reviewerName: getTextProperty(p, "검토자") || undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return mockApplications;
  }
}

// ─── 관리자: 알림 ──────────────────────────────────────────

export async function getNotifications(recipientId?: string): Promise<AppNotification[]> {
  if (USE_MOCK || !databaseIds.notifications) {
    return recipientId
      ? mockNotifications.filter((n) => n.recipientId === recipientId)
      : mockNotifications;
  }

  try {
    const filter = recipientId
      ? { property: "수신자ID", rich_text: { equals: recipientId } }
      : undefined;

    const pages = await queryAllPages(databaseIds.notifications, {
      sorts: [{ property: "생성일", direction: "descending" }],
      filter: filter as Parameters<typeof notion.databases.query>[0]["filter"],
    });

    return pages.map((p) => ({
      id: p.id as string,
      recipientId: getTextProperty(p, "수신자ID"),
      title: getTextProperty(p, "제목"),
      message: getTextProperty(p, "메시지"),
      link: getTextProperty(p, "링크"),
      isRead: getTextProperty(p, "읽음여부") === "true",
      createdAt: getTextProperty(p, "생성일"),
      kind: getTextProperty(p, "유형") as AppNotification["kind"],
    }));
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return mockNotifications;
  }
}
