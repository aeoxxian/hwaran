import { NextRequest, NextResponse } from "next/server";
import notion, { databaseIds } from "@/lib/notion";
import { mockNotifications } from "@/lib/mock-data";
import { getNotifications } from "@/lib/data";
import { guard } from "@/lib/api-auth";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.notifications;

export async function GET(request: NextRequest) {
  const g = guard(request, { minAdminLevel: 1 });
  if (!g.ok) return g.response;
  const user = g.user;

  try {
    const notifications = await getNotifications({ userId: user.id, role: user.role });
    return NextResponse.json({ notifications });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "알림 조회 실패" }, { status: 500 });
  }
}

/** PATCH: 읽음 처리 (body: { id: string } 또는 { all: true }) */
export async function PATCH(request: NextRequest) {
  const g = guard(request, { minAdminLevel: 1 });
  if (!g.ok) return g.response;
  const user = g.user;

  const body = await request.json();
  const recipientKeys = [user.id, `role:${user.role}`];

  if (USE_MOCK) {
    if (body.all) {
      const target = mockNotifications.filter((n) => recipientKeys.includes(n.recipientId));
      target.forEach((n) => (n.isRead = true));
      return NextResponse.json({ success: true, updated: target.length });
    }
    if (body.id) {
      const n = mockNotifications.find((n) => n.id === body.id);
      if (!n) return NextResponse.json({ error: "알림을 찾을 수 없습니다." }, { status: 404 });
      if (!recipientKeys.includes(n.recipientId)) {
        return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
      }
      n.isRead = true;
      return NextResponse.json({ success: true, updated: 1 });
    }
    return NextResponse.json({ error: "id 또는 all 플래그가 필요합니다." }, { status: 400 });
  }

  try {
    if (body.all) {
      const res = await notion.databases.query({
        database_id: databaseIds.notifications,
        filter: {
          and: [
            {
              or: recipientKeys.map((k) => ({
                property: "수신자ID",
                rich_text: { equals: k },
              })),
            },
            { property: "읽음여부", checkbox: { equals: false } },
          ],
        },
        page_size: 100,
      });

      const ids = res.results.map((p) => (p as { id: string }).id);
      await Promise.all(
        ids.map((pageId) =>
          notion.pages.update({
            page_id: pageId,
            properties: { 읽음여부: { checkbox: true } },
          }),
        ),
      );
      return NextResponse.json({ success: true, updated: ids.length });
    }

    if (body.id) {
      const page = (await notion.pages.retrieve({ page_id: body.id })) as Record<string, unknown>;
      const props = page.properties as Record<string, Record<string, unknown>>;
      const recipientId =
        (props["수신자ID"]?.rich_text as Array<{ plain_text: string }> | undefined)?.[0]?.plain_text || "";
      if (recipientId && !recipientKeys.includes(recipientId)) {
        return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
      }
      await notion.pages.update({
        page_id: body.id,
        properties: { 읽음여부: { checkbox: true } },
      });
      return NextResponse.json({ success: true, updated: 1 });
    }

    return NextResponse.json({ error: "id 또는 all 플래그가 필요합니다." }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "읽음 처리 실패" }, { status: 500 });
  }
}
