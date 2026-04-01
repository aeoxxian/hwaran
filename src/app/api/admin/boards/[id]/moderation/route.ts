import { NextRequest, NextResponse } from "next/server";
import notion, { databaseIds, getTextProperty } from "@/lib/notion";
import { verifyToken } from "@/lib/auth";
import { getAdminLevel } from "@/lib/types";
import { mockBoardPosts } from "@/lib/mock-data";
import { sendNotificationEmail } from "@/lib/email";

function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("hwaran-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

const USE_MOCK = !process.env.NOTION_API_KEY;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getCurrentUser(request);
  if (!user || getAdminLevel(user.role) < 2) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const action = body.action as "approve" | "reject" | "resolve" | "pending";
  const note = body.note as string | undefined;

  if (!action) {
    return NextResponse.json({ error: "action 값이 필요합니다." }, { status: 400 });
  }

  const statusByAction: Record<string, string> = {
    approve: "승인",
    reject: "반려",
    resolve: "해결",
    pending: "대기",
  };
  const nextStatus = statusByAction[action] || "대기";

  if (USE_MOCK) {
    const target = mockBoardPosts.find((p) => p.id === id);
    if (!target) return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    target.status = nextStatus as typeof target.status;
    target.approvalStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : target.approvalStatus;
    if (note) target.reply = note;
    target.replyDate = new Date().toISOString().split("T")[0];
    return NextResponse.json({ post: target });
  }

  try {
    const page = (await notion.pages.retrieve({ page_id: id })) as Record<string, unknown>;
    const authorId = getTextProperty(page, "작성자ID");
    const title = getTextProperty(page, "제목");

    await notion.pages.update({
      page_id: id,
      properties: {
        상태: { select: { name: nextStatus } },
        승인상태: { select: { name: action === "approve" ? "approved" : action === "reject" ? "rejected" : "pending" } },
        ...(note
          ? {
              답변: { rich_text: [{ text: { content: note } }] },
              답변일: { date: { start: new Date().toISOString().split("T")[0] } },
            }
          : {}),
      },
    });

    await sendNotificationEmail({
      to: process.env.ADMIN_EMAIL || "",
      subject: `[화란] 커뮤니티 글 ${nextStatus} 처리`,
      html: `<p>${user.name}님이 게시글(${title || id})을 ${nextStatus} 처리했습니다.</p>`,
    });

    if (databaseIds.notifications && authorId) {
      await notion.pages.create({
        parent: { database_id: databaseIds.notifications },
        properties: {
          제목: { title: [{ text: { content: `내 게시글이 ${nextStatus} 처리되었습니다` } }] },
          메시지: { rich_text: [{ text: { content: `${title || "게시글"} 처리 상태: ${nextStatus}` } }] },
          수신자ID: { rich_text: [{ text: { content: authorId } }] },
          링크: { url: `/admin/boards` },
          읽음여부: { checkbox: false },
          생성일: { date: { start: new Date().toISOString().split("T")[0] } },
          유형: { select: { name: "기타" } },
        },
      });
    }

    return NextResponse.json({ success: true, status: nextStatus });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "모더레이션 처리에 실패했습니다." }, { status: 500 });
  }
}
