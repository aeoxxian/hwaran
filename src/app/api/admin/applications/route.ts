import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAdminLevel } from "@/lib/types";
import notion, { databaseIds } from "@/lib/notion";
import { mockApplications } from "@/lib/mock-data";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.applications;

function getUser(request: NextRequest) {
  const token = request.cookies.get("hwaran-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  const user = getUser(request);
  if (!user || getAdminLevel(user.role) < 2) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  if (USE_MOCK) {
    return NextResponse.json({ applications: mockApplications });
  }

  try {
    const res = await notion.databases.query({ database_id: databaseIds.applications });
    const applications = res.results.map((p) => {
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
        type: getText("유형"),
        clubName: getText("동아리명"),
        submitterName: getText("제출자"),
        submittedAt: getText("제출일"),
        status: getText("상태"),
        attachments: [],
        reviewComment: getText("검토의견") || undefined,
        reviewedAt: getText("검토일") || undefined,
        reviewerName: getText("검토자") || undefined,
      };
    });
    return NextResponse.json({ applications });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서류 목록 조회 실패" }, { status: 500 });
  }
}
