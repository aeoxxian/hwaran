import { NextResponse } from "next/server";
import { databaseIds } from "@/lib/notion";

/**
 * 운영 모드 점검 API
 * - mode: "mock" | "notion-live"
 * - notion: API key 보유 여부
 * - jwt: JWT secret 보유 여부 (값은 노출 안 함)
 * - databases: 각 DB id 설정 여부
 * - storage: S3 환경변수 설정 여부
 * - email: SMTP 환경변수 설정 여부
 */
export async function GET() {
  const hasNotionKey = Boolean(process.env.NOTION_API_KEY);
  const dbStatus = Object.fromEntries(
    Object.entries(databaseIds).map(([key, val]) => [key, Boolean(val)]),
  );
  const liveDbs = Object.values(dbStatus).filter(Boolean).length;
  const totalDbs = Object.keys(dbStatus).length;
  const mode = hasNotionKey && liveDbs > 0 ? "notion-live" : "mock";

  return NextResponse.json({
    mode,
    notion: hasNotionKey,
    jwt: Boolean(process.env.JWT_SECRET),
    storage: {
      configured: Boolean(
        process.env.AWS_REGION &&
          process.env.AWS_ACCESS_KEY_ID &&
          process.env.AWS_SECRET_ACCESS_KEY &&
          process.env.AWS_S3_BUCKET,
      ),
    },
    email: {
      configured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    },
    databases: dbStatus,
    summary: {
      configuredDatabases: liveDbs,
      totalDatabases: totalDbs,
    },
  });
}
