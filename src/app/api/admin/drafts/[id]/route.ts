import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAdminLevel, type UserRole } from "@/lib/types";
import notion, { databaseIds } from "@/lib/notion";
import { mockDrafts } from "@/lib/mock-data";
import { NEXT_REVIEWER } from "@/lib/constants";
import { sendNotificationEmail } from "@/lib/email";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.drafts;

function getUser(request: NextRequest) {
  const token = request.cookies.get("hwaran-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUser(request);
  if (!user || getAdminLevel(user.role) === 0) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;

  if (USE_MOCK) {
    const draft = mockDrafts.find((d) => d.id === id);
    if (!draft) return NextResponse.json({ error: "기안을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ draft });
  }

  try {
    const page = await notion.pages.retrieve({ page_id: id });
    return NextResponse.json({ draft: page });
  } catch {
    return NextResponse.json({ error: "기안 조회 실패" }, { status: 500 });
  }
}

/** PATCH: 결재 액션 (승인 | 반려 | 검토의견 | 수정요청) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUser(request);
  if (!user || getAdminLevel(user.role) === 0) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action, comment } = body as { action: "승인" | "반려" | "검토의견" | "수정요청"; comment?: string };

  if (USE_MOCK) {
    const draft = mockDrafts.find((d) => d.id === id);
    if (!draft) return NextResponse.json({ error: "기안을 찾을 수 없습니다." }, { status: 404 });

    const newComment = {
      id: `c${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      content: comment || "",
      action,
      createdAt: new Date().toISOString(),
    };
    draft.comments.push(newComment);

    if (action === "승인") {
      const next = NEXT_REVIEWER[user.role as UserRole];
      if (next) {
        draft.status = "최종검토중";
        draft.currentReviewerRole = next;
      } else {
        draft.status = "승인";
        draft.currentReviewerRole = undefined;
      }
    } else if (action === "반려") {
      draft.status = "반려";
      draft.currentReviewerRole = undefined;
    }
    draft.updatedAt = new Date().toISOString();
    return NextResponse.json({ draft });
  }

  try {
    let newStatus: string | undefined;
    const page = await notion.pages.retrieve({ page_id: id });
    const props = (page as Record<string, unknown>).properties as Record<string, Record<string, unknown>>;
    const currentStatus = (props["상태"]?.select as { name: string } | null)?.name ?? "";

    if (action === "승인") {
      if (currentStatus === "1차검토중") newStatus = "최종검토중";
      else if (currentStatus === "최종검토중") newStatus = "승인";
    } else if (action === "반려") {
      newStatus = "반려";
    }

    if (newStatus) {
      await notion.pages.update({
        page_id: id,
        properties: {
          상태: { select: { name: newStatus } },
          수정일: { date: { start: new Date().toISOString().split("T")[0] } },
        },
      });
    }

    await sendNotificationEmail({
      to: process.env.ADMIN_EMAIL || "",
      subject: `[화란] 기안 ${action} 처리`,
      html: `<p>${user.name}님이 기안에 '${action}' 처리했습니다.</p>`,
    });

    return NextResponse.json({ success: true, newStatus });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "결재 처리 실패" }, { status: 500 });
  }
}
