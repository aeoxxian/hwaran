import { NextRequest, NextResponse } from "next/server";
import notion, { databaseIds, getFilesProperty, getTextProperty } from "@/lib/notion";
import { verifyToken } from "@/lib/auth";
import { getAdminLevel } from "@/lib/types";
import { mockBoardPosts } from "@/lib/mock-data";
import type { BoardPost, User } from "@/lib/types";

type BoardCategory = BoardPost["category"];

const DB_TO_CATEGORY: Record<string, BoardCategory> = {
  [databaseIds.qna]: "qna",
  [databaseIds.complaints]: "complaints",
  [databaseIds.lostFound]: "lost-found",
  [databaseIds.promotions]: "promotions",
};

const USE_MOCK = !process.env.NOTION_API_KEY;

function getCurrentUser(request: NextRequest): User | null {
  const token = request.cookies.get("hwaran-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

function mapNotionPageToPost(page: Record<string, unknown>): BoardPost {
  const parent = page.parent as { database_id?: string };
  const category = DB_TO_CATEGORY[parent?.database_id || ""] || "qna";
  return {
    id: page.id as string,
    title: getTextProperty(page, "제목"),
    content: getTextProperty(page, "내용") || getTextProperty(page, "설명"),
    authorId: getTextProperty(page, "작성자ID") || undefined,
    author: getTextProperty(page, "작성자") || "익명",
    createdAt: getTextProperty(page, "작성일"),
    updatedAt: getTextProperty(page, "수정일") || undefined,
    category,
    status: (getTextProperty(page, "상태") || "대기") as BoardPost["status"],
    isAnonymous: getTextProperty(page, "익명여부") === "true",
    images: getFilesProperty(page, "이미지"),
    attachments: getFilesProperty(page, "첨부파일"),
    reply: getTextProperty(page, "답변") || undefined,
    replyDate: getTextProperty(page, "답변일") || undefined,
    clubId: getTextProperty(page, "동아리ID") || undefined,
    clubName: getTextProperty(page, "동아리명") || undefined,
    location: getTextProperty(page, "장소") || undefined,
    approvalStatus: (getTextProperty(page, "승인상태") as BoardPost["approvalStatus"]) || "approved",
    visibility: (getTextProperty(page, "공개범위") as BoardPost["visibility"]) || "public",
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (USE_MOCK) {
    const post = mockBoardPosts.find((p) => p.id === id);
    if (!post) return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ post });
  }

  try {
    const page = await notion.pages.retrieve({ page_id: id });
    return NextResponse.json({ post: mapNotionPageToPost(page as Record<string, unknown>) });
  } catch {
    return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  if (USE_MOCK) {
    const target = mockBoardPosts.find((p) => p.id === id);
    if (!target) return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    const canEdit = target.authorId === user.id || getAdminLevel(user.role) > 0;
    if (!canEdit) return NextResponse.json({ error: "수정 권한이 없습니다." }, { status: 403 });

    target.title = body.title ?? target.title;
    target.content = body.content ?? target.content;
    target.location = body.location ?? target.location;
    target.updatedAt = new Date().toISOString().split("T")[0];
    target.attachments = body.attachments ?? target.attachments;
    target.images = body.images ?? target.images;
    return NextResponse.json({ post: target });
  }

  try {
    const page = (await notion.pages.retrieve({ page_id: id })) as Record<string, unknown>;
    const post = mapNotionPageToPost(page);
    const canEdit = post.authorId === user.id || getAdminLevel(user.role) > 0;
    if (!canEdit) return NextResponse.json({ error: "수정 권한이 없습니다." }, { status: 403 });

    const properties: Record<string, unknown> = {
      수정일: { date: { start: new Date().toISOString().split("T")[0] } },
    };
    if (typeof body.title === "string") properties["제목"] = { title: [{ text: { content: body.title } }] };
    if (typeof body.content === "string") {
      properties[post.category === "lost-found" ? "설명" : "내용"] = {
        rich_text: [{ text: { content: body.content } }],
      };
    }
    if (typeof body.location === "string" && post.category === "lost-found") {
      properties["장소"] = { rich_text: [{ text: { content: body.location } }] };
    }

    await notion.pages.update({
      page_id: id,
      properties: properties as Parameters<typeof notion.pages.update>[0]["properties"],
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "게시글 수정에 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const { id } = await params;

  if (USE_MOCK) {
    const idx = mockBoardPosts.findIndex((p) => p.id === id);
    if (idx < 0) return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    const target = mockBoardPosts[idx];
    const canDelete = target.authorId === user.id || getAdminLevel(user.role) > 0;
    if (!canDelete) return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
    mockBoardPosts.splice(idx, 1);
    return NextResponse.json({ success: true });
  }

  try {
    const page = (await notion.pages.retrieve({ page_id: id })) as Record<string, unknown>;
    const post = mapNotionPageToPost(page);
    const canDelete = post.authorId === user.id || getAdminLevel(user.role) > 0;
    if (!canDelete) return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
    await notion.pages.update({ page_id: id, archived: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "게시글 삭제에 실패했습니다." }, { status: 500 });
  }
}
