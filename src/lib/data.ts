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
  mockOrgChartMembers,
} from "./mock-data";
import type {
  Notice, Club, ClubMember, CalendarEvent, BoardPost,
  GalleryAlbum, Document, InventoryItem, Banner, ExternalChannel,
  Draft, ClubApplication, AppNotification, DraftComment, UserRole,
  OrgChartMember,
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

function mapNotionToNotice(p: Record<string, unknown>): Notice {
  return {
    id: p.id as string,
    title: getTextProperty(p, "제목"),
    content: getTextProperty(p, "내용"),
    author: getTextProperty(p, "작성자"),
    createdAt: getTextProperty(p, "작성일"),
    isPinned: getTextProperty(p, "중요여부") === "true",
    attachments: getFilesProperty(p, "첨부파일"),
  };
}

export async function getNotices(): Promise<Notice[]> {
  if (USE_MOCK || !databaseIds.notices) return mockNotices;

  try {
    const pages = await queryAllPages(databaseIds.notices, {
      sorts: [{ property: "작성일", direction: "descending" }],
    });

    return pages.map(mapNotionToNotice);
  } catch (error) {
    console.error("Failed to fetch notices:", error);
    return mockNotices;
  }
}

export async function getNoticeById(id: string): Promise<Notice | null> {
  if (USE_MOCK || !databaseIds.notices) {
    return mockNotices.find((n) => n.id === id) || null;
  }
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    return mapNotionToNotice(page as Record<string, unknown>);
  } catch (error) {
    console.error("Failed to fetch notice:", error);
    return mockNotices.find((n) => n.id === id) || null;
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

// ─── 동아리 CRUD ──────────────────────────────────────────

export interface ClubInput {
  name: string;
  description: string;
  category: string;
  instagramUrl?: string;
  memberCount?: number;
  logo?: string;
  bannerImage?: string;
}

function buildClubProperties(input: Partial<ClubInput>): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  if (input.name !== undefined) props["이름"] = { title: [{ text: { content: input.name } }] };
  if (input.description !== undefined) props["소개"] = { rich_text: [{ text: { content: input.description } }] };
  if (input.category !== undefined) props["분류"] = { rich_text: [{ text: { content: input.category } }] };
  if (input.instagramUrl !== undefined) props["인스타그램"] = { rich_text: [{ text: { content: input.instagramUrl } }] };
  if (input.memberCount !== undefined) props["회원수"] = { rich_text: [{ text: { content: String(input.memberCount) } }] };
  if (input.logo !== undefined) {
    props["로고"] = input.logo
      ? { files: [{ name: "logo", type: "external", external: { url: input.logo } }] }
      : { files: [] };
  }
  if (input.bannerImage !== undefined) {
    props["배너이미지"] = input.bannerImage
      ? { files: [{ name: "banner", type: "external", external: { url: input.bannerImage } }] }
      : { files: [] };
  }
  return props;
}

export async function createClub(input: ClubInput): Promise<Club> {
  if (USE_MOCK || !databaseIds.clubs) {
    const newClub: Club = {
      id: `c${Date.now()}`,
      name: input.name,
      description: input.description,
      category: input.category,
      instagramUrl: input.instagramUrl,
      memberCount: input.memberCount ?? 0,
      logo: input.logo,
      bannerImage: input.bannerImage,
    };
    mockClubs.unshift(newClub);
    return newClub;
  }
  const page = await notion.pages.create({
    parent: { database_id: databaseIds.clubs },
    properties: buildClubProperties(input) as Parameters<typeof notion.pages.create>[0]["properties"],
  });
  return { ...input, id: page.id, memberCount: input.memberCount ?? 0 } as Club;
}

export async function updateClub(id: string, input: Partial<ClubInput>): Promise<Club | null> {
  if (USE_MOCK || !databaseIds.clubs) {
    const idx = mockClubs.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    mockClubs[idx] = { ...mockClubs[idx], ...input } as Club;
    return mockClubs[idx];
  }
  await notion.pages.update({
    page_id: id,
    properties: buildClubProperties(input) as Parameters<typeof notion.pages.update>[0]["properties"],
  });
  const page = await notion.pages.retrieve({ page_id: id });
  return mapNotionToClub(page as Record<string, unknown>);
}

export async function deleteClub(id: string): Promise<boolean> {
  if (USE_MOCK || !databaseIds.clubs) {
    const idx = mockClubs.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    mockClubs.splice(idx, 1);
    return true;
  }
  await notion.pages.update({ page_id: id, archived: true });
  return true;
}

// ─── 일정 ──────────────────────────────────────────────

export async function getEvents(): Promise<CalendarEvent[]> {
  if (USE_MOCK || !databaseIds.events) return mockEvents;

  try {
    const pages = await queryAllPages(databaseIds.events, {
      sorts: [{ property: "시작일", direction: "ascending" }],
    });

    return pages.map(mapNotionToEvent);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return mockEvents;
  }
}

function mapNotionToEvent(p: Record<string, unknown>): CalendarEvent {
  return {
    id: p.id as string,
    title: getTextProperty(p, "제목"),
    startDate: getTextProperty(p, "시작일"),
    endDate: getTextProperty(p, "종료일") || getTextProperty(p, "시작일"),
    clubId: getTextProperty(p, "동아리ID") || undefined,
    clubName: getTextProperty(p, "동아리명") || undefined,
    location: getTextProperty(p, "장소") || undefined,
    description: getTextProperty(p, "설명") || undefined,
    color: getTextProperty(p, "색상") || undefined,
  };
}

export interface EventInput {
  title: string;
  startDate: string;
  endDate?: string;
  clubId?: string;
  clubName?: string;
  location?: string;
  description?: string;
  color?: string;
}

function buildEventProperties(input: Partial<EventInput>): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  if (input.title !== undefined) props["제목"] = { title: [{ text: { content: input.title } }] };
  if (input.startDate !== undefined) props["시작일"] = { date: { start: input.startDate } };
  if (input.endDate !== undefined) props["종료일"] = { date: { start: input.endDate } };
  if (input.clubId !== undefined) props["동아리ID"] = { rich_text: [{ text: { content: input.clubId } }] };
  if (input.clubName !== undefined) props["동아리명"] = { rich_text: [{ text: { content: input.clubName } }] };
  if (input.location !== undefined) props["장소"] = { rich_text: [{ text: { content: input.location } }] };
  if (input.description !== undefined) props["설명"] = { rich_text: [{ text: { content: input.description } }] };
  if (input.color !== undefined) props["색상"] = { rich_text: [{ text: { content: input.color } }] };
  return props;
}

export async function createEvent(input: EventInput): Promise<CalendarEvent> {
  if (USE_MOCK || !databaseIds.events) {
    const newEvent: CalendarEvent = {
      id: `e${Date.now()}`,
      title: input.title,
      startDate: input.startDate,
      endDate: input.endDate || input.startDate,
      clubId: input.clubId,
      clubName: input.clubName,
      location: input.location,
      description: input.description,
      color: input.color,
    };
    mockEvents.unshift(newEvent);
    return newEvent;
  }
  const page = await notion.pages.create({
    parent: { database_id: databaseIds.events },
    properties: buildEventProperties(input) as Parameters<typeof notion.pages.create>[0]["properties"],
  });
  return {
    id: page.id,
    title: input.title,
    startDate: input.startDate,
    endDate: input.endDate || input.startDate,
    clubId: input.clubId,
    clubName: input.clubName,
    location: input.location,
    description: input.description,
    color: input.color,
  };
}

export async function updateEvent(id: string, input: Partial<EventInput>): Promise<CalendarEvent | null> {
  if (USE_MOCK || !databaseIds.events) {
    const idx = mockEvents.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    mockEvents[idx] = { ...mockEvents[idx], ...input } as CalendarEvent;
    return mockEvents[idx];
  }
  await notion.pages.update({
    page_id: id,
    properties: buildEventProperties(input) as Parameters<typeof notion.pages.update>[0]["properties"],
  });
  const page = await notion.pages.retrieve({ page_id: id });
  return mapNotionToEvent(page as Record<string, unknown>);
}

export async function deleteEvent(id: string): Promise<boolean> {
  if (USE_MOCK || !databaseIds.events) {
    const idx = mockEvents.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    mockEvents.splice(idx, 1);
    return true;
  }
  await notion.pages.update({ page_id: id, archived: true });
  return true;
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

export async function getBoardPostById(id: string): Promise<BoardPost | null> {
  if (USE_MOCK) {
    return mockBoardPosts.find((p) => p.id === id) || null;
  }

  try {
    const page = (await notion.pages.retrieve({ page_id: id })) as Record<string, unknown>;
    const parent = page.parent as { database_id?: string } | undefined;
    const dbId = parent?.database_id || "";
    const category: BoardCategory =
      dbId === databaseIds.qna
        ? "qna"
        : dbId === databaseIds.complaints
        ? "complaints"
        : dbId === databaseIds.lostFound
        ? "lost-found"
        : dbId === databaseIds.promotions
        ? "promotions"
        : "qna";
    return mapNotionToBoardPost(page, category);
  } catch (error) {
    console.error("Failed to fetch board post:", error);
    return mockBoardPosts.find((p) => p.id === id) || null;
  }
}

export async function getRecentBoardPosts(
  category: BoardCategory,
  limit = 3,
): Promise<BoardPost[]> {
  const { posts } = await getBoardPosts(category, { pageSize: limit, page: 1 });
  return posts.slice(0, limit);
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

function mapNotionToGalleryAlbum(p: Record<string, unknown>): GalleryAlbum {
  const images = getFilesProperty(p, "이미지");
  return {
    id: p.id as string,
    title: getTextProperty(p, "행사명"),
    date: getTextProperty(p, "날짜"),
    description: getTextProperty(p, "설명"),
    coverImage: images[0] || "/images/gallery-placeholder.png",
    images,
    clubId: getTextProperty(p, "동아리ID") || undefined,
    clubName: getTextProperty(p, "동아리명") || undefined,
  };
}

export async function getGalleryAlbums(): Promise<GalleryAlbum[]> {
  if (USE_MOCK || !databaseIds.gallery) return mockGalleryAlbums;

  try {
    const pages = await queryAllPages(databaseIds.gallery, {
      sorts: [{ property: "날짜", direction: "descending" }],
    });

    return pages.map(mapNotionToGalleryAlbum);
  } catch (error) {
    console.error("Failed to fetch gallery:", error);
    return mockGalleryAlbums;
  }
}

export interface GalleryAlbumInput {
  title: string;
  date: string;
  description: string;
  images: string[];
  clubId?: string;
  clubName?: string;
}

export async function createGalleryAlbum(input: GalleryAlbumInput): Promise<GalleryAlbum> {
  if (USE_MOCK || !databaseIds.gallery) {
    const newAlbum: GalleryAlbum = {
      id: `g${Date.now()}`,
      title: input.title,
      date: input.date,
      description: input.description,
      coverImage: input.images[0] || "/images/gallery-placeholder.png",
      images: input.images,
      clubId: input.clubId,
      clubName: input.clubName,
    };
    mockGalleryAlbums.unshift(newAlbum);
    return newAlbum;
  }

  const properties: Record<string, unknown> = {
    행사명: { title: [{ text: { content: input.title } }] },
    날짜: { date: { start: input.date } },
    설명: { rich_text: [{ text: { content: input.description } }] },
    이미지: {
      files: input.images.map((url, i) => ({
        name: `image-${i + 1}`,
        type: "external",
        external: { url },
      })),
    },
  };
  if (input.clubId) properties["동아리ID"] = { rich_text: [{ text: { content: input.clubId } }] };
  if (input.clubName) properties["동아리명"] = { rich_text: [{ text: { content: input.clubName } }] };

  const page = await notion.pages.create({
    parent: { database_id: databaseIds.gallery },
    properties: properties as Parameters<typeof notion.pages.create>[0]["properties"],
  });
  return mapNotionToGalleryAlbum(await notion.pages.retrieve({ page_id: page.id }) as Record<string, unknown>);
}

export async function deleteGalleryAlbum(id: string): Promise<boolean> {
  if (USE_MOCK || !databaseIds.gallery) {
    const idx = mockGalleryAlbums.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    mockGalleryAlbums.splice(idx, 1);
    return true;
  }
  await notion.pages.update({ page_id: id, archived: true });
  return true;
}

// ─── 자료실 ──────────────────────────────────────────────

function mapNotionToDocument(p: Record<string, unknown>): Document {
  return {
    id: p.id as string,
    title: getTextProperty(p, "제목"),
    category: getTextProperty(p, "분류") as Document["category"],
    fileUrl: getFilesProperty(p, "파일")[0] || "#",
    createdAt: getTextProperty(p, "작성일"),
  };
}

export async function getDocuments(): Promise<Document[]> {
  if (USE_MOCK || !databaseIds.documents) return mockDocuments;

  try {
    const pages = await queryAllPages(databaseIds.documents, {
      sorts: [{ property: "작성일", direction: "descending" }],
    });

    return pages.map(mapNotionToDocument);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return mockDocuments;
  }
}

export interface DocumentInput {
  title: string;
  category: Document["category"];
  fileUrl: string;
}

export async function createDocument(input: DocumentInput): Promise<Document> {
  if (USE_MOCK || !databaseIds.documents) {
    const newDoc: Document = {
      id: `doc${Date.now()}`,
      title: input.title,
      category: input.category,
      fileUrl: input.fileUrl,
      createdAt: new Date().toISOString().split("T")[0],
    };
    mockDocuments.unshift(newDoc);
    return newDoc;
  }

  const today = new Date().toISOString().split("T")[0];
  const properties: Record<string, unknown> = {
    제목: { title: [{ text: { content: input.title } }] },
    분류: { rich_text: [{ text: { content: input.category } }] },
    작성일: { date: { start: today } },
    파일: {
      files: [{ name: input.title, type: "external", external: { url: input.fileUrl } }],
    },
  };

  const page = await notion.pages.create({
    parent: { database_id: databaseIds.documents },
    properties: properties as Parameters<typeof notion.pages.create>[0]["properties"],
  });
  return {
    id: page.id,
    title: input.title,
    category: input.category,
    fileUrl: input.fileUrl,
    createdAt: today,
  };
}

export async function deleteDocument(id: string): Promise<boolean> {
  if (USE_MOCK || !databaseIds.documents) {
    const idx = mockDocuments.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    mockDocuments.splice(idx, 1);
    return true;
  }
  await notion.pages.update({ page_id: id, archived: true });
  return true;
}

// ─── 물품 관리 ──────────────────────────────────────────────

function mapNotionToInventoryItem(p: Record<string, unknown>): InventoryItem {
  return {
    id: p.id as string,
    name: getTextProperty(p, "이름"),
    quantity: parseInt(getTextProperty(p, "수량")) || 0,
    status: getTextProperty(p, "상태") as InventoryItem["status"],
    location: getTextProperty(p, "보관위치"),
    note: getTextProperty(p, "비고") || undefined,
  };
}

export async function getInventory(): Promise<InventoryItem[]> {
  if (USE_MOCK || !databaseIds.inventory) return mockInventory;

  try {
    const pages = await queryAllPages(databaseIds.inventory);

    return pages.map(mapNotionToInventoryItem);
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return mockInventory;
  }
}

export interface InventoryInput {
  name: string;
  quantity: number;
  status: InventoryItem["status"];
  location: string;
  note?: string;
}

function buildInventoryProperties(input: Partial<InventoryInput>): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  if (input.name !== undefined) props["이름"] = { title: [{ text: { content: input.name } }] };
  if (input.quantity !== undefined) props["수량"] = { rich_text: [{ text: { content: String(input.quantity) } }] };
  if (input.status !== undefined) props["상태"] = { rich_text: [{ text: { content: input.status } }] };
  if (input.location !== undefined) props["보관위치"] = { rich_text: [{ text: { content: input.location } }] };
  if (input.note !== undefined) props["비고"] = { rich_text: [{ text: { content: input.note } }] };
  return props;
}

export async function createInventoryItem(input: InventoryInput): Promise<InventoryItem> {
  if (USE_MOCK || !databaseIds.inventory) {
    const newItem: InventoryItem = { id: `inv${Date.now()}`, ...input };
    mockInventory.unshift(newItem);
    return newItem;
  }
  const page = await notion.pages.create({
    parent: { database_id: databaseIds.inventory },
    properties: buildInventoryProperties(input) as Parameters<typeof notion.pages.create>[0]["properties"],
  });
  return { id: page.id, ...input };
}

export async function updateInventoryItem(id: string, input: Partial<InventoryInput>): Promise<InventoryItem | null> {
  if (USE_MOCK || !databaseIds.inventory) {
    const idx = mockInventory.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    mockInventory[idx] = { ...mockInventory[idx], ...input } as InventoryItem;
    return mockInventory[idx];
  }
  await notion.pages.update({
    page_id: id,
    properties: buildInventoryProperties(input) as Parameters<typeof notion.pages.update>[0]["properties"],
  });
  const page = await notion.pages.retrieve({ page_id: id });
  return mapNotionToInventoryItem(page as Record<string, unknown>);
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  if (USE_MOCK || !databaseIds.inventory) {
    const idx = mockInventory.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    mockInventory.splice(idx, 1);
    return true;
  }
  await notion.pages.update({ page_id: id, archived: true });
  return true;
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

// ─── 조직도 ──────────────────────────────────────────────

function mapNotionToOrgChartMember(p: Record<string, unknown>): OrgChartMember {
  return {
    id: p.id as string,
    name: getTextProperty(p, "이름"),
    title: getTextProperty(p, "직책"),
    department: getTextProperty(p, "부서"),
    team: getTextProperty(p, "팀") || undefined,
    order: parseInt(getTextProperty(p, "순서")) || 0,
  };
}

export async function getOrgChartMembers(): Promise<OrgChartMember[]> {
  if (USE_MOCK || !databaseIds.orgchart) {
    return [...mockOrgChartMembers].sort((a, b) => a.order - b.order);
  }

  try {
    const pages = await queryAllPages(databaseIds.orgchart);
    return pages.map(mapNotionToOrgChartMember).sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Failed to fetch org chart:", error);
    return [...mockOrgChartMembers].sort((a, b) => a.order - b.order);
  }
}

export interface OrgChartInput {
  name: string;
  title: string;
  department: string;
  team?: string;
  order: number;
}

function buildOrgChartProperties(input: Partial<OrgChartInput>): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  if (input.name !== undefined) props["이름"] = { title: [{ text: { content: input.name } }] };
  if (input.title !== undefined) props["직책"] = { rich_text: [{ text: { content: input.title } }] };
  if (input.department !== undefined) props["부서"] = { rich_text: [{ text: { content: input.department } }] };
  if (input.team !== undefined) props["팀"] = { rich_text: [{ text: { content: input.team || "" } }] };
  if (input.order !== undefined) props["순서"] = { rich_text: [{ text: { content: String(input.order) } }] };
  return props;
}

export async function createOrgChartMember(input: OrgChartInput): Promise<OrgChartMember> {
  if (USE_MOCK || !databaseIds.orgchart) {
    const newMember: OrgChartMember = { id: `o${Date.now()}`, ...input };
    mockOrgChartMembers.push(newMember);
    return newMember;
  }
  const page = await notion.pages.create({
    parent: { database_id: databaseIds.orgchart },
    properties: buildOrgChartProperties(input) as Parameters<typeof notion.pages.create>[0]["properties"],
  });
  return { id: page.id, ...input };
}

export async function updateOrgChartMember(id: string, input: Partial<OrgChartInput>): Promise<OrgChartMember | null> {
  if (USE_MOCK || !databaseIds.orgchart) {
    const idx = mockOrgChartMembers.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    mockOrgChartMembers[idx] = { ...mockOrgChartMembers[idx], ...input } as OrgChartMember;
    return mockOrgChartMembers[idx];
  }
  await notion.pages.update({
    page_id: id,
    properties: buildOrgChartProperties(input) as Parameters<typeof notion.pages.update>[0]["properties"],
  });
  const page = await notion.pages.retrieve({ page_id: id });
  return mapNotionToOrgChartMember(page as Record<string, unknown>);
}

export async function deleteOrgChartMember(id: string): Promise<boolean> {
  if (USE_MOCK || !databaseIds.orgchart) {
    const idx = mockOrgChartMembers.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    mockOrgChartMembers.splice(idx, 1);
    return true;
  }
  await notion.pages.update({ page_id: id, archived: true });
  return true;
}

// ─── 관리자: 기안 ──────────────────────────────────────────

function mapNotionToDraft(p: Record<string, unknown>): Draft {
  return {
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
    comments: [] as DraftComment[],
    createdAt: getTextProperty(p, "작성일"),
    updatedAt: getTextProperty(p, "수정일"),
  };
}

export async function getDrafts(): Promise<Draft[]> {
  if (USE_MOCK || !databaseIds.drafts) return mockDrafts;

  try {
    const pages = await queryAllPages(databaseIds.drafts, {
      sorts: [{ property: "작성일", direction: "descending" }],
    });

    return pages.map(mapNotionToDraft);
  } catch (error) {
    console.error("Failed to fetch drafts:", error);
    return mockDrafts;
  }
}

export async function getDraftById(id: string): Promise<Draft | null> {
  if (USE_MOCK || !databaseIds.drafts) {
    return mockDrafts.find((d) => d.id === id) || null;
  }
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    return mapNotionToDraft(page as Record<string, unknown>);
  } catch (error) {
    console.error("Failed to fetch draft:", error);
    return mockDrafts.find((d) => d.id === id) || null;
  }
}

// ─── 관리자: 서류신청 ──────────────────────────────────────

function mapNotionToApplication(p: Record<string, unknown>): ClubApplication {
  return {
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
  };
}

export async function getApplications(): Promise<ClubApplication[]> {
  if (USE_MOCK || !databaseIds.applications) return mockApplications;

  try {
    const pages = await queryAllPages(databaseIds.applications, {
      sorts: [{ property: "제출일", direction: "descending" }],
    });

    return pages.map(mapNotionToApplication);
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return mockApplications;
  }
}

export async function getApplicationById(id: string): Promise<ClubApplication | null> {
  if (USE_MOCK || !databaseIds.applications) {
    return mockApplications.find((a) => a.id === id) || null;
  }
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    return mapNotionToApplication(page as Record<string, unknown>);
  } catch (error) {
    console.error("Failed to fetch application:", error);
    return mockApplications.find((a) => a.id === id) || null;
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
