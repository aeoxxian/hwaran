import { NextRequest, NextResponse } from "next/server";
import notion, { databaseIds, getTextProperty } from "@/lib/notion";
import { hashPassword, verifyPassword, createToken } from "@/lib/auth";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.members;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const body = await request.json();
  const { action } = body;

  // Rate limiting: 로그인 5회/분, 회원가입 3회/분
  const limit = action === "register"
    ? checkRateLimit(`auth:register:${ip}`, 3)
    : checkRateLimit(`auth:login:${ip}`, 5);
  if (!limit.success) return rateLimitResponse(limit.resetMs);

  if (USE_MOCK) {
    return NextResponse.json(
      { error: "Notion API가 연결되지 않았습니다. .env.local을 설정해주세요." },
      { status: 503 }
    );
  }

  try {

    if (action === "register") {
      const { name, email, password, clubId } = body;

      const existing = await notion.databases.query({
        database_id: databaseIds.members,
        filter: { property: "이메일", email: { equals: email } },
      });

      if (existing.results.length > 0) {
        return NextResponse.json({ error: "이미 등록된 이메일입니다." }, { status: 409 });
      }

      const hashedPassword = await hashPassword(password);

      const response = await notion.pages.create({
        parent: { database_id: databaseIds.members },
        properties: {
          이름: { title: [{ text: { content: name } }] },
          이메일: { email },
          비밀번호: { rich_text: [{ text: { content: hashedPassword } }] },
          동아리: { rich_text: [{ text: { content: clubId || "" } }] },
          역할: { select: { name: "회원" } },
          가입일: { date: { start: new Date().toISOString().split("T")[0] } },
        },
      });

      const user = { id: response.id, name, email, role: "회원" as const };
      const token = createToken(user);

      const res = NextResponse.json({ user }, { status: 201 });
      res.cookies.set("hwaran-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return res;
    }

    if (action === "login") {
      const { email, password } = body;

      const users = await notion.databases.query({
        database_id: databaseIds.members,
        filter: { property: "이메일", email: { equals: email } },
      });

      if (users.results.length === 0) {
        return NextResponse.json({ error: "등록되지 않은 이메일입니다." }, { status: 401 });
      }

      const userPage = users.results[0] as Record<string, unknown>;
      const storedHash = getTextProperty(userPage, "비밀번호");

      const passwordValid = await verifyPassword(password, storedHash);
      if (!passwordValid) {
        return NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 401 });
      }

      const user = {
        id: userPage.id as string,
        name: getTextProperty(userPage, "이름"),
        email: getTextProperty(userPage, "이메일"),
        role: getTextProperty(userPage, "역할") as import("@/lib/types").UserRole,
        clubId: getTextProperty(userPage, "동아리") || undefined,
      };

      const token = createToken(user);
      const loginRes = NextResponse.json({ user });
      loginRes.cookies.set("hwaran-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return loginRes;
    }

    return NextResponse.json({ error: "유효하지 않은 액션입니다." }, { status: 400 });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "인증 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
