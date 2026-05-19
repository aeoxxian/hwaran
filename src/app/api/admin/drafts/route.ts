import { NextRequest, NextResponse } from "next/server";
import { type UserRole } from "@/lib/types";
import notion, { databaseIds } from "@/lib/notion";
import { mockDrafts } from "@/lib/mock-data";
import { SUBMIT_STATUS, NEXT_REVIEWER } from "@/lib/constants";
import { sendNotificationEmail } from "@/lib/email";
import { guard } from "@/lib/api-auth";
import { getDrafts } from "@/lib/data";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.drafts;

export async function GET(request: NextRequest) {
  const g = guard(request, { minAdminLevel: 1 });
  if (!g.ok) return g.response;

  try {
    const drafts = await getDrafts();
    return NextResponse.json({ drafts });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "기안 목록 조회 실패" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const g = guard(request, { minAdminLevel: 1 });
  if (!g.ok) return g.response;
  const user = g.user;

  const body = await request.json();
  const { title, content, type, attachments = [], asDraft = false } = body;

  if (!title || !content || !type) {
    return NextResponse.json({ error: "제목/내용/유형은 필수입니다." }, { status: 400 });
  }

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
    mockDrafts.unshift(newDraft as (typeof mockDrafts)[number]);
    return NextResponse.json({ draft: newDraft }, { status: 201 });
  }

  try {
    const today = new Date().toISOString().split("T")[0];
    const properties: Record<string, unknown> = {
      제목: { title: [{ text: { content: title } }] },
      내용: { rich_text: [{ text: { content } }] },
      유형: { select: { name: type } },
      상태: { select: { name: status } },
      작성자ID: { rich_text: [{ text: { content: user.id } }] },
      작성자명: { rich_text: [{ text: { content: user.name } }] },
      작성자역할: { select: { name: user.role } },
      작성일: { date: { start: today } },
      수정일: { date: { start: today } },
    };
    if (reviewerRole) properties["현재결재자역할"] = { select: { name: reviewerRole } };

    if (Array.isArray(attachments) && attachments.length > 0) {
      properties["첨부파일"] = {
        files: attachments.map((url: string, index: number) => ({
          name: `첨부파일-${index + 1}`,
          type: "external",
          external: { url },
        })),
      };
    }

    const page = await notion.pages.create({
      parent: { database_id: databaseIds.drafts },
      properties: properties as Parameters<typeof notion.pages.create>[0]["properties"],
    });

    if (!asDraft && process.env.ADMIN_EMAIL) {
      await sendNotificationEmail({
        to: process.env.ADMIN_EMAIL,
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
