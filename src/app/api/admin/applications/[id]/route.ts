import { NextRequest, NextResponse } from "next/server";
import notion, { databaseIds } from "@/lib/notion";
import { mockApplications } from "@/lib/mock-data";
import { sendNotificationEmail } from "@/lib/email";
import { getApplicationById } from "@/lib/data";
import { guard } from "@/lib/api-auth";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.applications;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = guard(request, { minAdminLevel: 2 });
  if (!g.ok) return g.response;

  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) {
    return NextResponse.json({ error: "서류를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ application });
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
  const { action, reviewComment } = body as { action: "승인" | "반려"; reviewComment?: string };

  const newStatus = action === "승인" ? "승인" : "반려";

  if (USE_MOCK) {
    const app = mockApplications.find((a) => a.id === id);
    if (!app) return NextResponse.json({ error: "서류를 찾을 수 없습니다." }, { status: 404 });
    app.status = newStatus;
    app.reviewComment = reviewComment;
    app.reviewedAt = new Date().toISOString().split("T")[0];
    app.reviewerName = user.name;
    return NextResponse.json({ application: app });
  }

  try {
    await notion.pages.update({
      page_id: id,
      properties: {
        상태: { select: { name: newStatus } },
        검토의견: { rich_text: [{ text: { content: reviewComment || "" } }] },
        검토일: { date: { start: new Date().toISOString().split("T")[0] } },
        검토자: { rich_text: [{ text: { content: user.name } }] },
      },
    });

    if (process.env.ADMIN_EMAIL) {
      await sendNotificationEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `[화란] 서류신청 ${action}`,
        html: `<p>${user.name}님이 서류신청을 '${action}' 처리했습니다.</p>`,
      });
    }

    const application = await getApplicationById(id);
    return NextResponse.json({ success: true, newStatus, application });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "처리 실패" }, { status: 500 });
  }
}
