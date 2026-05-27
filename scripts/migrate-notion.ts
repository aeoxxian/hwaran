/**
 * Notion 마이그레이션 스크립트 (1회용).
 *
 * - 누락된 신규 DB 3개 생성: BoardComments / DraftComments / ModerationLogs
 * - 기존 DB 스키마 확장:
 *   - 게시판 4종: 작성자ID, 승인상태, 수정일, 첨부파일, 공개범위, 답변, 답변일 등 추가
 *   - 게시판 상태 select 옵션에 승인/반려 슈퍼셋 부여 (promotions 는 상태 컬럼 자체 추가)
 *   - Drafts: 작성자역할/현재결재자역할 select 에 "관리자" 옵션 추가
 *
 * 실행: npx tsx scripts/migrate-notion.ts
 */

import { resolve } from "path";
import { config } from "dotenv";
import { Client } from "@notionhq/client";

config({ path: resolve(process.cwd(), ".env.local") });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const parentPageId = process.env.NOTION_PARENT_PAGE_ID || "";

const BOARD_STATUS_OPTIONS = [
  { name: "대기" },
  { name: "답변완료" },
  { name: "해결" },
  { name: "미해결" },
  { name: "승인" },
  { name: "반려" },
];
const BOARD_APPROVAL_OPTIONS = [
  { name: "pending" },
  { name: "approved" },
  { name: "rejected" },
];
const VISIBILITY_OPTIONS = [{ name: "public" }, { name: "internal" }];

interface NewDb {
  envKey: string;
  title: string;
  properties: Record<string, unknown>;
}

const NEW_DBS: NewDb[] = [
  {
    envKey: "NOTION_BOARD_COMMENTS_DB",
    title: "게시판 댓글 (BoardComments)",
    properties: {
      게시글ID: { title: {} },
      내용: { rich_text: {} },
      작성자ID: { rich_text: {} },
      작성자명: { rich_text: {} },
      작성자역할: { rich_text: {} },
      관리자댓글여부: { checkbox: {} },
      작성일: { date: {} },
    },
  },
  {
    envKey: "NOTION_DRAFT_COMMENTS_DB",
    title: "기안 결재 코멘트 (DraftComments)",
    properties: {
      기안ID: { title: {} },
      내용: { rich_text: {} },
      작성자ID: { rich_text: {} },
      작성자명: { rich_text: {} },
      작성자역할: {
        select: {
          options: [
            { name: "국원" }, { name: "국장팀장" }, { name: "회장단" }, { name: "관리자" },
            { name: "동아리장" }, { name: "부동아리장" }, { name: "회원" },
          ],
        },
      },
      액션: {
        select: {
          options: [
            { name: "검토의견" }, { name: "승인" }, { name: "반려" }, { name: "수정요청" },
          ],
        },
      },
      작성일: { date: {} },
    },
  },
  {
    envKey: "NOTION_MODERATION_LOGS_DB",
    title: "모더레이션 로그 (ModerationLogs)",
    properties: {
      게시글ID: { title: {} },
      액션: {
        select: {
          options: [
            { name: "approve" }, { name: "reject" }, { name: "resolve" }, { name: "pending" },
          ],
        },
      },
      상태: { rich_text: {} },
      사유: { rich_text: {} },
      처리자ID: { rich_text: {} },
      처리자명: { rich_text: {} },
      처리자역할: {
        select: {
          options: [
            { name: "회장단" }, { name: "국장팀장" }, { name: "국원" }, { name: "관리자" },
          ],
        },
      },
      생성일: { date: {} },
    },
  },
];

function getEnvId(key: string): string {
  return (process.env[key] || "").replace(/-/g, "").trim();
}

/** 누락된 DB 생성. 이미 .env.local 에 ID가 있으면 스킵. */
async function createMissingDbs(): Promise<Record<string, string>> {
  if (!parentPageId) {
    throw new Error("NOTION_PARENT_PAGE_ID 가 설정되지 않았습니다.");
  }
  const created: Record<string, string> = {};
  for (const db of NEW_DBS) {
    if (getEnvId(db.envKey)) {
      console.log(`  [SKIP] ${db.envKey} 이미 설정됨`);
      continue;
    }
    const response = await notion.databases.create({
      parent: { type: "page_id", page_id: parentPageId },
      title: [{ type: "text", text: { content: db.title } }],
      properties: db.properties as Parameters<typeof notion.databases.create>[0]["properties"],
    });
    created[db.envKey] = response.id;
    console.log(`  [CREATE] ${db.title} -> ${response.id}`);
  }
  return created;
}

/** 기존 select 옵션과 신규 옵션을 이름 기준으로 union. */
function unionSelectOptions(
  existing: Array<{ name: string; id?: string; color?: string }> | undefined,
  desired: Array<{ name: string }>,
): Array<{ name: string }> {
  const map = new Map<string, { name: string }>();
  for (const opt of existing ?? []) map.set(opt.name, { name: opt.name });
  for (const opt of desired) if (!map.has(opt.name)) map.set(opt.name, opt);
  return Array.from(map.values());
}

async function getDb(id: string) {
  return notion.databases.retrieve({ database_id: id });
}

async function ensureProperty(
  dbId: string,
  propName: string,
  propDef: Record<string, unknown>,
) {
  const db = (await getDb(dbId)) as unknown as { properties: Record<string, { type: string }> };
  if (db.properties[propName]) return false;
  await notion.databases.update({
    database_id: dbId,
    properties: { [propName]: propDef } as Parameters<typeof notion.databases.update>[0]["properties"],
  });
  console.log(`    + 컬럼 추가: ${propName}`);
  return true;
}

async function ensureSelectOptions(
  dbId: string,
  propName: string,
  desired: Array<{ name: string }>,
) {
  const db = (await getDb(dbId)) as unknown as {
    properties: Record<string, { type: string; select?: { options: Array<{ name: string; id?: string; color?: string }> } }>;
  };
  const prop = db.properties[propName];
  if (!prop || prop.type !== "select") return false;
  const merged = unionSelectOptions(prop.select?.options, desired);
  // 옵션 수가 같다면 변경 없음
  if (merged.length === (prop.select?.options.length ?? 0)) return false;
  await notion.databases.update({
    database_id: dbId,
    properties: {
      [propName]: { select: { options: merged } },
    } as Parameters<typeof notion.databases.update>[0]["properties"],
  });
  console.log(`    ~ select 옵션 확장: ${propName} (총 ${merged.length}개)`);
  return true;
}

async function migrateBoardDb(
  envKey: string,
  label: string,
  contentProp: "내용" | "설명",
  opts: { anonymous?: boolean } = {},
) {
  const id = getEnvId(envKey);
  if (!id) { console.log(`  [SKIP] ${label} (${envKey} 미설정)`); return; }
  console.log(`  [BOARD] ${label}`);

  // 모든 게시판 공통으로 있어야 하는 속성
  await ensureProperty(id, "작성자ID", { rich_text: {} });
  await ensureProperty(id, "수정일", { date: {} });
  await ensureProperty(id, "첨부파일", { files: {} });
  await ensureProperty(id, "공개범위", { select: { options: VISIBILITY_OPTIONS } });
  await ensureProperty(id, "승인상태", { select: { options: BOARD_APPROVAL_OPTIONS } });
  await ensureProperty(id, "답변", { rich_text: {} });
  await ensureProperty(id, "답변일", { date: {} });
  // 본문 컬럼이 누락된 경우(예: promotions에 lost-found 식 "설명"이 있을 가능성은 낮지만 안전망)
  await ensureProperty(id, contentProp, { rich_text: {} });

  // 익명 게시판(qna/complaints)만 익명여부 체크박스가 필요.
  if (opts.anonymous) {
    await ensureProperty(id, "익명여부", { checkbox: {} });
  }

  // 상태 컬럼은 promotions 에는 없을 수 있으므로 보장 후 확장
  await ensureProperty(id, "상태", { select: { options: BOARD_STATUS_OPTIONS } });
  await ensureSelectOptions(id, "상태", BOARD_STATUS_OPTIONS);
  await ensureSelectOptions(id, "승인상태", BOARD_APPROVAL_OPTIONS);
}

async function migrateDraftsDb() {
  const id = getEnvId("NOTION_DRAFTS_DB");
  if (!id) { console.log("  [SKIP] Drafts (NOTION_DRAFTS_DB 미설정)"); return; }
  console.log("  [DRAFTS]");
  await ensureSelectOptions(id, "작성자역할", [
    { name: "국원" }, { name: "국장팀장" }, { name: "회장단" }, { name: "관리자" },
  ]);
  await ensureSelectOptions(id, "현재결재자역할", [
    { name: "국장팀장" }, { name: "회장단" }, { name: "관리자" },
  ]);
}

async function migrateDocumentsDb() {
  const id = getEnvId("NOTION_DOCUMENTS_DB");
  if (!id) { console.log("  [SKIP] Documents (NOTION_DOCUMENTS_DB 미설정)"); return; }
  console.log("  [DOCUMENTS]");
  // 분류가 select 인지 확인. select가 아니면 기존 데이터가 있을 수 있어 자동 변환은 위험.
  const db = (await getDb(id)) as unknown as {
    properties: Record<string, { type: string }>;
  };
  const t = db.properties["분류"]?.type;
  if (t && t !== "select") {
    console.warn(`    ! "분류" 컬럼이 ${t} 타입입니다 (코드는 select 가정). 수동 변경 필요.`);
  } else {
    await ensureSelectOptions(id, "분류", [
      { name: "회칙" }, { name: "양식" }, { name: "회의록" }, { name: "기타" },
    ]);
  }
}

async function migrateOrgChartDb() {
  const id = getEnvId("NOTION_ORGCHART_DB");
  if (!id) { console.log("  [SKIP] OrgChart (NOTION_ORGCHART_DB 미설정)"); return; }
  console.log("  [ORGCHART]");
  const db = (await getDb(id)) as unknown as {
    properties: Record<string, { type: string }>;
  };
  const t = db.properties["순서"]?.type;
  if (t && t !== "number") {
    console.warn(`    ! "순서" 컬럼이 ${t} 타입입니다 (코드는 number 가정). 컬럼 type 을 직접 변경하거나 DB 재생성이 필요할 수 있습니다.`);
  }
  // 누락 컬럼은 채워줌
  await ensureProperty(id, "이름", { title: {} });
  await ensureProperty(id, "직책", { rich_text: {} });
  await ensureProperty(id, "부서", { rich_text: {} });
  await ensureProperty(id, "팀", { rich_text: {} });
  await ensureProperty(id, "순서", { number: {} });
}

async function main() {
  if (!process.env.NOTION_API_KEY) {
    console.error("NOTION_API_KEY 가 설정되지 않았습니다.");
    process.exit(1);
  }

  console.log("\n=== Notion 마이그레이션 시작 ===\n");

  console.log("[1/3] 누락된 DB 생성");
  const created = await createMissingDbs();

  console.log("\n[2/3] 기존 게시판/기안/문서/조직도 DB 스키마 확장");
  await migrateBoardDb("NOTION_QNA_DB", "QnA", "내용", { anonymous: true });
  await migrateBoardDb("NOTION_COMPLAINTS_DB", "Complaints", "내용", { anonymous: true });
  await migrateBoardDb("NOTION_LOST_FOUND_DB", "Lost & Found", "설명");
  await migrateBoardDb("NOTION_PROMOTIONS_DB", "Promotions", "내용");
  await migrateDraftsDb();
  await migrateDocumentsDb();
  await migrateOrgChartDb();

  console.log("\n[3/3] .env.local 에 추가할 항목");
  if (Object.keys(created).length === 0) {
    console.log("  (추가할 신규 ID 없음)");
  } else {
    for (const [k, v] of Object.entries(created)) console.log(`${k}=${v}`);
  }
  console.log("\n=== 완료 ===\n");
}

main().catch((err) => {
  console.error("마이그레이션 중 오류:", err);
  process.exit(1);
});
