/**
 * OrgChart "순서" 컬럼 타입을 rich_text → number 로 변환.
 *
 * 절차:
 * 1) 기존 페이지의 순서(text) 값을 메모리에 백업
 * 2) databases.update 로 순서 컬럼을 number 타입으로 변경
 * 3) 각 페이지의 순서를 백업해둔 값으로 다시 채움
 *
 * 안전하지 않은 경우(파싱 불가) order=999 로 기본 적용.
 */

import { resolve } from "path";
import { config } from "dotenv";
import { Client } from "@notionhq/client";

config({ path: resolve(process.cwd(), ".env.local") });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dbId = (process.env.NOTION_ORGCHART_DB || "").trim();

async function main() {
  if (!dbId) {
    console.error("NOTION_ORGCHART_DB 가 설정되지 않았습니다.");
    process.exit(1);
  }

  console.log("[1/4] 기존 OrgChart 페이지 조회");
  type Page = { id: string; properties: Record<string, Record<string, unknown>> };
  const allPages: Page[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion.databases.query({
      database_id: dbId,
      start_cursor: cursor,
      page_size: 100,
    });
    allPages.push(...(res.results as unknown as Page[]));
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);
  console.log(`  총 ${allPages.length}개 페이지 발견`);

  console.log("[2/4] 현재 '순서' 값 백업 (rich_text 파싱)");
  const backup = new Map<string, number>();
  for (const p of allPages) {
    const prop = p.properties["순서"];
    let raw = "";
    if (prop?.type === "rich_text") {
      const rt = prop.rich_text as Array<{ plain_text: string }>;
      raw = rt?.[0]?.plain_text ?? "";
    } else if (prop?.type === "number") {
      backup.set(p.id, (prop.number as number) ?? 999);
      continue;
    }
    const parsed = parseInt(raw, 10);
    backup.set(p.id, Number.isFinite(parsed) ? parsed : 999);
  }
  console.log(`  ${backup.size}개 값 백업`);

  console.log("[3/4] '순서' 컬럼 타입 변경: rich_text → number");
  // Notion 은 단일 update 호출로 property type 을 새 타입으로 교체하면
  // 기존 데이터가 호환되지 않으면 비워집니다. 다음 단계에서 다시 채웁니다.
  try {
    await notion.databases.update({
      database_id: dbId,
      properties: { 순서: { number: {} } } as Parameters<typeof notion.databases.update>[0]["properties"],
    });
    console.log("  컬럼 타입 변경 완료");
  } catch (e) {
    console.error("  타입 변경 실패. 컬럼을 일단 제거 후 재생성합니다.", e);
    await notion.databases.update({
      database_id: dbId,
      properties: { 순서: null } as Parameters<typeof notion.databases.update>[0]["properties"],
    });
    await notion.databases.update({
      database_id: dbId,
      properties: { 순서: { number: {} } } as Parameters<typeof notion.databases.update>[0]["properties"],
    });
    console.log("  재생성 완료");
  }

  console.log("[4/4] 백업한 값으로 순서 재기록");
  let restored = 0;
  for (const [pageId, value] of backup) {
    try {
      await notion.pages.update({
        page_id: pageId,
        properties: { 순서: { number: value } } as Parameters<typeof notion.pages.update>[0]["properties"],
      });
      restored++;
    } catch (e) {
      console.warn(`  복원 실패 ${pageId}:`, e);
    }
  }
  console.log(`  ${restored}/${backup.size} 복원 완료`);

  console.log("\n=== OrgChart 순서 마이그레이션 완료 ===");
}

main().catch((err) => {
  console.error("오류:", err);
  process.exit(1);
});
