import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAdminLevel, type UserRole } from "@/lib/types";
import notion, { databaseIds } from "@/lib/notion";
import { mockDrafts } from "@/lib/mock-data";
import { SUBMIT_STATUS, NEXT_REVIEWER } from "@/lib/constants";
import { sendNotificationEmail } from "@/lib/email";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.drafts;

function getUser(request: NextRequest) {
  const token = request.cookies.get("hwaran-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  const user = getUser(request);
  if (!user || getAdminLevel(user.role) === 0) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  if (USE_MOCK) {
    return NextResponse.json({ drafts: mockDrafts });
  }

  try {
    const res = await notion.databases.query({ database_id: databaseIds.drafts });
    const drafts = res.results.map((p) => {
      const page = p as Record<string, unknown>;
      const props = page.properties as Record<string, Record<string, unknown>>;
      const getText = (prop: string) => {
        const p2 = props[prop];
        if (!p2) return "";
        if (p2.type === "title") return (p2.title as Array<{ plain_text: string }>)[0]?.plain_text || "";
        if (p2.type === "rich_text") return (p2.rich_text as Array<{ plain_text: string }>)[0]?.plain_text || "";
        if (p2.type === "select") return (p2.select as { name: string } | null)?.name || "";
        if (p2.type === "date") return (p2.date as { start: string } | null)?.start || "";
        return "";
      };
      return {
        id: page.id as string,
        title: getText("제목"),
        content: getText("내용"),
        type: getText("유형"),
        status: getText("상태"),
        authorId: getText("작성자ID"),
        authorName: getText("작성자명"),
        authorRole: getText("작성자역할") as UserRole,
        currentReviewerRole: (getText("현재결재자역할") || undefined) as UserRole | undefined,
        attachments: [],
        comments: [],
        createdAt: getText("작성일"),
        updatedAt: getText("수정일"),
      };
    });
    return NextResponse.json({ drafts });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "기안 목록 조회 실패" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getUser(request);
  if (!user || getAdminLevel(user.role) === 0) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json();
  const { title, content, type, attachments = [], asDraft = false } = body;

  const reviewerRole = asDraft ? undefined : NEXT_REVIEWER[user.role as UserRole];
  const status = asDraft ? "임시저장" : (SUBMIT_STATUS[user.role as UserRole] ?? "1차검토중");

  if (USE_MOCK) {
    const newDraft = {
      id: `d${Date.now()}`,
      title,
      content,
      type,
      status,
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      currentReviewerRole: reviewerRole,
      attachments,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ draft: newDraft }, { status: 201 });
  }

  try {
    const today = new Date().toISOString().split("T")[0];
    const page = await notion.pages.create({
      parent: { database_id: databaseIds.drafts },
      properties: {
        제목: { title: [{ text: { content: title } }] },
        내용: { rich_text: [{ text: { content: content } }] },
        유형: { select: { name: type } },
        상태: { select: { name: status } },
        작성자ID: { rich_text: [{ text: { content: user.id } }] },
        작성자명: { rich_text: [{ text: { content: user.name } }] },
        작성자역할: { select: { name: user.role } },
        ...(reviewerRole ? { 현재결재자역할: { select: { name: reviewerRole } } } : {}),
        작성일: { date: { start: today } },
        수정일: { date: { start: today } },
      },
    });

    if (!asDraft) {
      await sendNotificationEmail({
        to: process.env.ADMIN_EMAIL || "",
        subject: `[화란] 새 기안: ${title}`,
        html: `<p>${user.name}님이 새 기안을 상신했습니다: <strong>${title}</strong></p>`,
      });
    }

    return NextResponse.json({ draft: { id: page.id } }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "기안 생성 실패" }, { status: 500 });
  }
}
