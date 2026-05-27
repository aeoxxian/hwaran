import { NextRequest, NextResponse } from "next/server";
import notion, { getTextProperty } from "@/lib/notion";
import { mockBoardPosts } from "@/lib/mock-data";
import { sendNotificationEmail } from "@/lib/email";
import { guard } from "@/lib/api-auth";
import {
  getModerationLogs,
  createModerationLog,
  createNotification,
} from "@/lib/data";

const USE_MOCK = !process.env.NOTION_API_KEY;

const STATUS_BY_ACTION: Record<string, string> = {
  approve: "승인",
  reject: "반려",
  resolve: "해결",
  pending: "대기",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = guard(request, { minAdminLevel: 1 });
  if (!g.ok) return g.response;
  const { id } = await params;
  const logs = await getModerationLogs(id);
  return NextResponse.json({ logs });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = guard(request, { minAdminLevel: 2 });
  if (!g.ok) return g.response;
  const user = g.user;

  const { id } = await params;
  const body = await request.json();
  const action = body.action as "approve" | "reject" | "resolve" | "pending";
  const note = body.note as string | undefined;

  if (!action || !STATUS_BY_ACTION[action]) {
    return NextResponse.json({ error: "유효하지 않은 action입니다." }, { status: 400 });
  }

  const nextStatus = STATUS_BY_ACTION[action];
  const requiresNote = action === "reject";
  if (requiresNote && !(note && note.trim().length > 0)) {
    return NextResponse.json(
      { error: "반려 시 사유를 반드시 입력해야 합니다." },
      { status: 400 },
    );
  }

  // 로그 영속화 (mock / Notion 둘 다 createModerationLog가 분기)
  const log = await createModerationLog({
    postId: id,
    action,
    status: nextStatus,
    note: note?.trim() || undefined,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
  });

  if (USE_MOCK) {
    const target = mockBoardPosts.find((p) => p.id === id);
    if (!target) return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    target.status = nextStatus as typeof target.status;
    target.approvalStatus =
      action === "approve" ? "approved" : action === "reject" ? "rejected" : target.approvalStatus;
    if (note) target.reply = note;
    target.replyDate = new Date().toISOString().split("T")[0];
    return NextResponse.json({ post: target, log });
  }

  try {
    const page = (await notion.pages.retrieve({ page_id: id })) as Record<string, unknown>;
    const authorId = getTextProperty(page, "작성자ID");
    const title = getTextProperty(page, "제목");

    await notion.pages.update({
      page_id: id,
      properties: {
        상태: { select: { name: nextStatus } },
        승인상태: {
          select: {
            name:
              action === "approve" ? "approved" : action === "reject" ? "rejected" : "pending",
          },
        },
        ...(note
          ? {
              답변: { rich_text: [{ text: { content: note } }] },
              답변일: { date: { start: new Date().toISOString().split("T")[0] } },
            }
          : {}),
      },
    });

    if (process.env.ADMIN_EMAIL) {
      await sendNotificationEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `[화란] 커뮤니티 글 ${nextStatus} 처리`,
        html: `<p>${user.name}님이 게시글(${title || id})을 ${nextStatus} 처리했습니다.${
          note ? `<br/>사유: ${note}` : ""
        }</p>`,
      });
    }

    if (authorId) {
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
      await createNotification({
        recipientId: authorId,
        title: `내 게시글이 ${nextStatus} 처리되었습니다`,
        message: `${title || "게시글"} 처리 상태: ${nextStatus}${note ? ` · 사유: ${note}` : ""}`,
        link: `${baseUrl}/boards`,
        kind: "기타",
      });
    }

    return NextResponse.json({ success: true, status: nextStatus, log });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "모더레이션 처리에 실패했습니다." }, { status: 500 });
  }
}
