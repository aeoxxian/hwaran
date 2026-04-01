import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAdminLevel } from "@/lib/types";
import notion, { databaseIds } from "@/lib/notion";
import { mockNotifications } from "@/lib/mock-data";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.notifications;

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
    const mine = mockNotifications.filter((n) => n.recipientId === user.id);
    return NextResponse.json({ notifications: mine });
  }

  try {
    const res = await notion.databases.query({
      database_id: databaseIds.notifications,
      filter: { property: "수신자ID", rich_text: { equals: user.id } },
      sorts: [{ property: "생성일", direction: "descending" }],
    });
    const notifications = res.results.map((p) => {
      const page = p as Record<string, unknown>;
      const props = page.properties as Record<string, Record<string, unknown>>;
      const getText = (prop: string) => {
        const p2 = props[prop];
        if (!p2) return "";
        if (p2.type === "title") return (p2.title as Array<{ plain_text: string }>)[0]?.plain_text || "";
        if (p2.type === "rich_text") return (p2.rich_text as Array<{ plain_text: string }>)[0]?.plain_text || "";
        if (p2.type === "url") return (p2.url as string) || "";
        if (p2.type === "select") return (p2.select as { name: string } | null)?.name || "";
        if (p2.type === "date") return (p2.date as { start: string } | null)?.start || "";
        if (p2.type === "checkbox") return String(p2.checkbox);
        return "";
      };
      return {
        id: page.id as string,
        recipientId: getText("수신자ID"),
        title: getText("제목"),
        message: getText("메시지"),
        link: getText("링크"),
        isRead: getText("읽음여부") === "true",
        createdAt: getText("생성일"),
        kind: getText("유형"),
      };
    });
    return NextResponse.json({ notifications });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "알림 조회 실패" }, { status: 500 });
  }
}

/** PATCH: 읽음 처리 (body: { id: string } 또는 { all: true }) */
export async function PATCH(request: NextRequest) {
  const user = getUser(request);
  if (!user || getAdminLevel(user.role) === 0) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json();

  if (USE_MOCK) {
    if (body.all) {
      mockNotifications
        .filter((n) => n.recipientId === user.id)
        .forEach((n) => (n.isRead = true));
    } else if (body.id) {
      const n = mockNotifications.find((n) => n.id === body.id);
      if (n) n.isRead = true;
    }
    return NextResponse.json({ success: true });
  }

  try {
    if (body.id) {
      await notion.pages.update({
        page_id: body.id,
        properties: { 읽음여부: { checkbox: true } },
      });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "읽음 처리 실패" }, { status: 500 });
  }
}
