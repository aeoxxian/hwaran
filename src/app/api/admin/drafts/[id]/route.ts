import { NextRequest, NextResponse } from "next/server";
import { roleMatchesReviewer, type UserRole } from "@/lib/types";
import notion, { databaseIds } from "@/lib/notion";
import { mockDrafts } from "@/lib/mock-data";
import { NEXT_REVIEWER } from "@/lib/constants";
import { sendNotificationEmail } from "@/lib/email";
import {
  getDraftById,
  createDraftComment,
  createNotification,
} from "@/lib/data";
import { guard } from "@/lib/api-auth";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.drafts;

type DraftAction = "승인" | "반려" | "검토의견" | "수정요청";

/**
 * 결재 상태 머신.
 * - "승인": 현재 결재자가 자신의 역할에 해당하는 단계를 통과시켰을 때.
 *   - NEXT_REVIEWER[user.role] 가 존재하면 그 역할이 다음 결재자가 되고 status 는 "최종검토중".
 *   - 존재하지 않으면(=회장단/관리자) status 는 "승인" 으로 종료.
 * - "반려": status="반려", currentReviewerRole=undefined.
 * - "검토의견", "수정요청": 상태 변경 없음(코멘트만 추가).
 */
function nextState(action: DraftAction, currentRole: UserRole): {
  newStatus?: string;
  newReviewerRole?: UserRole | null; // null = clear
} {
  if (action === "승인") {
    const next = NEXT_REVIEWER[currentRole];
    if (next) return { newStatus: "최종검토중", newReviewerRole: next };
    return { newStatus: "승인", newReviewerRole: null };
  }
  if (action === "반려") {
    return { newStatus: "반려", newReviewerRole: null };
  }
  return {};
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = guard(request, { minAdminLevel: 1 });
  if (!g.ok) return g.response;

  const { id } = await params;
  const draft = await getDraftById(id);
  if (!draft) {
    return NextResponse.json({ error: "기안을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ draft });
}

/** PATCH: 결재 액션 (승인 | 반려 | 검토의견 | 수정요청) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = guard(request, { minAdminLevel: 1 });
  if (!g.ok) return g.response;
  const user = g.user;

  const { id } = await params;
  const body = await request.json();
  const { action, comment } = body as { action: DraftAction; comment?: string };
  if (!action) {
    return NextResponse.json({ error: "action 값이 필요합니다." }, { status: 400 });
  }

  // 결재 액션은 현재 결재자 본인만 수행할 수 있음.
  // 검토의견/수정요청은 결재자가 아니어도 가능(기록만 남김).
  const requiresReviewerCheck = action === "승인" || action === "반려";
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  if (USE_MOCK) {
    const draft = mockDrafts.find((d) => d.id === id);
    if (!draft) return NextResponse.json({ error: "기안을 찾을 수 없습니다." }, { status: 404 });

    if (requiresReviewerCheck && !roleMatchesReviewer(user.role, draft.currentReviewerRole)) {
      return NextResponse.json(
        { error: "현재 결재 차례가 아닙니다." },
        { status: 403 },
      );
    }

    // 코멘트 영속화
    await createDraftComment(id, {
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      content: comment || "",
      action,
    });

    const { newStatus, newReviewerRole } = nextState(action, user.role);
    if (newStatus) draft.status = newStatus as typeof draft.status;
    if (newReviewerRole !== undefined) {
      draft.currentReviewerRole = newReviewerRole === null ? undefined : newReviewerRole;
    }
    draft.updatedAt = now;

    // 알림 전파
    if (newStatus && newStatus !== draft.status) {
      // (no-op: 상태가 바뀌지 않은 경우 알림 안 보냄)
    }
    if (action === "승인" && newReviewerRole) {
      await createNotification({
        recipientId: `role:${newReviewerRole}`,
        title: "결재 대기 중인 기안이 있습니다",
        message: `${draft.title} (이전 결재자: ${user.name})`,
        link: `${baseUrl}/admin/drafts/${id}`,
        kind: "기안",
      });
    } else if (action === "승인" || action === "반려") {
      // 작성자에게 알림
      await createNotification({
        recipientId: draft.authorId,
        title: `기안이 ${action} 처리되었습니다`,
        message: `${draft.title} — 처리자: ${user.name}`,
        link: `${baseUrl}/admin/drafts/${id}`,
        kind: "기안",
      });
    }

    return NextResponse.json({ draft });
  }

  try {
    const draft = await getDraftById(id);
    if (!draft) return NextResponse.json({ error: "기안을 찾을 수 없습니다." }, { status: 404 });

    if (requiresReviewerCheck && !roleMatchesReviewer(user.role, draft.currentReviewerRole)) {
      return NextResponse.json(
        { error: "현재 결재 차례가 아닙니다." },
        { status: 403 },
      );
    }

    // 코멘트 영속화 (DraftComments DB에 page 추가)
    await createDraftComment(id, {
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      content: comment || "",
      action,
    });

    const { newStatus, newReviewerRole } = nextState(action, user.role);

    if (newStatus) {
      const updateProps: Record<string, unknown> = {
        상태: { select: { name: newStatus } },
        수정일: { date: { start: today } },
      };
      // newReviewerRole === null → 결재 완료/반려 (속성 비우기)
      // newReviewerRole === UserRole → 다음 결재자로 갱신
      // newReviewerRole === undefined → 변경 없음
      if (newReviewerRole === null) {
        updateProps["현재결재자역할"] = { select: null };
      } else if (newReviewerRole) {
        updateProps["현재결재자역할"] = { select: { name: newReviewerRole } };
      }
      await notion.pages.update({
        page_id: id,
        properties: updateProps as Parameters<typeof notion.pages.update>[0]["properties"],
      });
    }

    // 알림: 승인되어 다음 결재자가 생기면 그 역할에게, 종료(승인 완료/반려)면 작성자에게
    if (action === "승인" && newReviewerRole) {
      await createNotification({
        recipientId: `role:${newReviewerRole}`,
        title: "결재 대기 중인 기안이 있습니다",
        message: `${draft.title} (이전 결재자: ${user.name})`,
        link: `${baseUrl}/admin/drafts/${id}`,
        kind: "기안",
      });
    } else if (action === "승인" || action === "반려") {
      await createNotification({
        recipientId: draft.authorId,
        title: `기안이 ${action} 처리되었습니다`,
        message: `${draft.title} — 처리자: ${user.name}`,
        link: `${baseUrl}/admin/drafts/${id}`,
        kind: "기안",
      });
    } else if (action === "검토의견" || action === "수정요청") {
      // 작성자에게도 코멘트 발생 알림
      await createNotification({
        recipientId: draft.authorId,
        title: `기안에 ${action}이(가) 등록됐습니다`,
        message: `${user.name}님 — ${draft.title}`,
        link: `${baseUrl}/admin/drafts/${id}`,
        kind: "기안",
      });
    }

    if (process.env.ADMIN_EMAIL) {
      await sendNotificationEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `[화란] 기안 ${action} 처리`,
        html: `<p>${user.name}님이 기안에 '${action}' 처리했습니다.</p>`,
      });
    }

    const updated = await getDraftById(id);
    return NextResponse.json({ success: true, newStatus, draft: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "결재 처리 실패" }, { status: 500 });
  }
}
