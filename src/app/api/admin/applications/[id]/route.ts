import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAdminLevel } from "@/lib/types";
import notion, { databaseIds } from "@/lib/notion";
import { mockApplications } from "@/lib/mock-data";
import { sendNotificationEmail } from "@/lib/email";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.applications;

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
  if (!user || getAdminLevel(user.role) < 2) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;

  if (USE_MOCK) {
    const app = mockApplications.find((a) => a.id === id);
    if (!app) return NextResponse.json({ error: "서류를 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ application: app });
  }

  try {
    const page = await notion.pages.retrieve({ page_id: id });
    return NextResponse.json({ application: page });
  } catch {
    return NextResponse.json({ error: "서류 조회 실패" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUser(request);
  if (!user || getAdminLevel(user.role) < 2) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

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

    await sendNotificationEmail({
      to: process.env.ADMIN_EMAIL || "",
      subject: `[화란] 서류신청 ${action}`,
      html: `<p>${user.name}님이 서류신청을 '${action}' 처리했습니다.</p>`,
    });

    return NextResponse.json({ success: true, newStatus });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "처리 실패" }, { status: 500 });
  }
}
