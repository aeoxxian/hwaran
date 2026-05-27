/**
 * Notion DB Connectivity Check
 *
 * Probes every Notion DB referenced by src/lib/notion.ts:databaseIds,
 * runs a tiny query to verify reachability, fetches the schema to detect
 * drift against the canonical schema in scripts/setup-notion-dbs.ts,
 * and prints a per-DB status table plus a 1-line summary.
 *
 * Usage:
 *   npx tsx scripts/check-db-connectivity.ts
 */

import { resolve } from "path";
import { config } from "dotenv";
import { Client, APIResponseError } from "@notionhq/client";

config({ path: resolve(process.cwd(), ".env.local") });

// ─── 20 DBs (mirrors src/lib/notion.ts databaseIds) ─────────────────
interface DbSpec {
  key: string;        // databaseIds key
  envVar: string;     // env var name
  expectedProps: string[]; // expected Korean property names (from setup-notion-dbs.ts)
}

const DBS: DbSpec[] = [
  {
    key: "members",
    envVar: "NOTION_MEMBERS_DB",
    expectedProps: ["이름", "이메일", "비밀번호", "동아리", "역할", "가입일"],
  },
  {
    key: "notices",
    envVar: "NOTION_NOTICES_DB",
    expectedProps: ["제목", "내용", "작성자", "작성일", "중요여부", "첨부파일"],
  },
  {
    key: "clubs",
    envVar: "NOTION_CLUBS_DB",
    expectedProps: ["이름", "소개", "로고", "인스타그램", "배너이미지", "분류", "회원수"],
  },
  {
    key: "clubMembers",
    envVar: "NOTION_CLUB_MEMBERS_DB",
    expectedProps: ["이름", "역할", "소개", "프로필사진", "동아리ID"],
  },
  {
    key: "events",
    envVar: "NOTION_EVENTS_DB",
    expectedProps: ["제목", "시작일", "종료일", "동아리ID", "동아리명", "장소", "설명", "색상"],
  },
  {
    key: "qna",
    envVar: "NOTION_QNA_DB",
    expectedProps: [
      "제목", "내용", "작성자", "작성자ID", "작성일", "수정일",
      "답변", "답변일", "상태", "승인상태", "익명여부", "공개범위", "첨부파일",
    ],
  },
  {
    key: "complaints",
    envVar: "NOTION_COMPLAINTS_DB",
    expectedProps: [
      "제목", "내용", "작성자", "작성자ID", "작성일", "수정일",
      "답변", "답변일", "상태", "승인상태", "익명여부", "공개범위", "첨부파일",
    ],
  },
  {
    key: "lostFound",
    envVar: "NOTION_LOST_FOUND_DB",
    expectedProps: [
      "제목", "설명", "이미지", "장소", "상태", "승인상태",
      "작성자", "작성자ID", "작성일", "수정일", "답변", "답변일", "첨부파일",
    ],
  },
  {
    key: "promotions",
    envVar: "NOTION_PROMOTIONS_DB",
    expectedProps: [
      "제목", "내용", "동아리ID", "동아리명", "작성자", "작성자ID",
      "작성일", "수정일", "이미지", "첨부파일", "상태", "승인상태", "답변", "답변일",
    ],
  },
  {
    key: "gallery",
    envVar: "NOTION_GALLERY_DB",
    expectedProps: ["행사명", "날짜", "설명", "이미지", "동아리ID", "동아리명"],
  },
  {
    key: "documents",
    envVar: "NOTION_DOCUMENTS_DB",
    expectedProps: ["제목", "분류", "파일", "작성일"],
  },
  {
    key: "inventory",
    envVar: "NOTION_INVENTORY_DB",
    expectedProps: ["이름", "수량", "상태", "보관위치", "비고"],
  },
  {
    key: "banners",
    envVar: "NOTION_BANNERS_DB",
    expectedProps: ["동아리명", "동아리ID", "이미지", "링크", "활성여부"],
  },
  {
    key: "boardComments",
    envVar: "NOTION_BOARD_COMMENTS_DB",
    expectedProps: ["게시글ID", "내용", "작성자ID", "작성자명", "작성자역할", "관리자댓글여부", "작성일"],
  },
  {
    key: "drafts",
    envVar: "NOTION_DRAFTS_DB",
    expectedProps: [
      "제목", "내용", "유형", "상태", "작성자ID", "작성자명",
      "작성자역할", "현재결재자역할", "첨부파일", "작성일", "수정일",
    ],
  },
  {
    key: "draftComments",
    envVar: "NOTION_DRAFT_COMMENTS_DB",
    expectedProps: ["기안ID", "내용", "작성자ID", "작성자명", "작성자역할", "액션", "작성일"],
  },
  {
    key: "applications",
    envVar: "NOTION_APPLICATIONS_DB",
    expectedProps: [
      "제목", "유형", "동아리명", "제출자", "제출일", "상태",
      "첨부파일", "검토의견", "검토일", "검토자",
    ],
  },
  {
    key: "notifications",
    envVar: "NOTION_NOTIFICATIONS_DB",
    expectedProps: ["제목", "메시지", "수신자ID", "링크", "읽음여부", "생성일", "유형"],
  },
  {
    key: "orgchart",
    envVar: "NOTION_ORGCHART_DB",
    expectedProps: ["이름", "직책", "부서", "팀", "순서"],
  },
  {
    key: "moderationLogs",
    envVar: "NOTION_MODERATION_LOGS_DB",
    expectedProps: ["게시글ID", "액션", "상태", "사유", "처리자ID", "처리자명", "처리자역할", "생성일"],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────
const QUERY_TIMEOUT_MS = 5_000;
const COUNT_CAP = 100;

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolveP, rejectP) => {
    const t = setTimeout(() => rejectP(new Error(`timeout after ${ms}ms (${label})`)), ms);
    p.then((v) => {
      clearTimeout(t);
      resolveP(v);
    }).catch((e) => {
      clearTimeout(t);
      rejectP(e);
    });
  });
}

interface ProbeResult {
  key: string;
  envVar: string;
  status: string;          // UNSET / OK / NOT_FOUND / UNAUTHORIZED / FAIL
  rowCount: string;        // "0", "5", "100+", "-"
  schemaNotes: string;     // OK / SCHEMA_DRIFT details / "-"
  drift: boolean;
}

function classifyError(err: unknown): { kind: string; message: string } {
  if (err instanceof APIResponseError) {
    if (err.status === 404 || err.code === "object_not_found") {
      return { kind: "NOT_FOUND", message: err.message };
    }
    if (err.status === 401 || err.code === "unauthorized") {
      return { kind: "UNAUTHORIZED", message: err.message };
    }
    return { kind: "FAIL", message: `${err.code ?? err.status}: ${err.message}` };
  }
  const msg = err instanceof Error ? err.message : String(err);
  return { kind: "FAIL", message: msg };
}

async function countRows(notion: Client, dbId: string): Promise<string> {
  let total = 0;
  let cursor: string | undefined = undefined;
  for (;;) {
    const resp: Awaited<ReturnType<typeof notion.databases.query>> = await withTimeout(
      notion.databases.query({
        database_id: dbId,
        page_size: 100,
        start_cursor: cursor,
      }),
      QUERY_TIMEOUT_MS,
      "count-page",
    );
    total += resp.results.length;
    if (total >= COUNT_CAP) return `${COUNT_CAP}+`;
    if (!resp.has_more || !resp.next_cursor) break;
    cursor = resp.next_cursor;
  }
  return String(total);
}

async function probe(notion: Client, spec: DbSpec): Promise<ProbeResult> {
  const id = process.env[spec.envVar] || "";
  if (!id) {
    return {
      key: spec.key,
      envVar: spec.envVar,
      status: "UNSET",
      rowCount: "-",
      schemaNotes: "-",
      drift: false,
    };
  }

  // 1) tiny query to verify reachability
  try {
    await withTimeout(
      notion.databases.query({ database_id: id, page_size: 1 }),
      QUERY_TIMEOUT_MS,
      "query",
    );
  } catch (err) {
    const c = classifyError(err);
    return {
      key: spec.key,
      envVar: spec.envVar,
      status: c.kind === "FAIL" ? `FAIL: ${c.message}` : c.kind,
      rowCount: "-",
      schemaNotes: "-",
      drift: false,
    };
  }

  // 2) schema retrieve + drift detection
  let schemaNotes = "OK";
  let drift = false;
  try {
    const meta = await withTimeout(
      notion.databases.retrieve({ database_id: id }),
      QUERY_TIMEOUT_MS,
      "retrieve",
    );
    const actualProps = Object.keys((meta as { properties: Record<string, unknown> }).properties);
    const expected = new Set(spec.expectedProps);
    const actual = new Set(actualProps);
    const missing = spec.expectedProps.filter((p) => !actual.has(p));
    const extra = actualProps.filter((p) => !expected.has(p));
    if (missing.length || extra.length) {
      drift = true;
      const parts: string[] = [];
      if (missing.length) parts.push(`missing=[${missing.join(", ")}]`);
      if (extra.length) parts.push(`extra=[${extra.join(", ")}]`);
      schemaNotes = `SCHEMA_DRIFT ${parts.join(" ")}`;
    }
  } catch (err) {
    const c = classifyError(err);
    schemaNotes = `schema-retrieve ${c.kind}: ${c.message}`;
    drift = true;
  }

  // 3) row count (capped)
  let rowCount = "-";
  try {
    rowCount = await countRows(notion, id);
  } catch (err) {
    const c = classifyError(err);
    rowCount = `count-failed (${c.kind})`;
  }

  return {
    key: spec.key,
    envVar: spec.envVar,
    status: "OK",
    rowCount,
    schemaNotes,
    drift,
  };
}

// ─── Pretty printing ────────────────────────────────────────────────
function padRight(s: string, n: number): string {
  // visible-width padding ignoring CJK width (fine for our keys/env vars; rough for Korean schema notes)
  if (s.length >= n) return s;
  return s + " ".repeat(n - s.length);
}

function printTable(rows: ProbeResult[]) {
  const headers = ["DB Key", "Env Var", "Status", "Rows", "Schema Notes"];
  const widths = [
    Math.max(headers[0].length, ...rows.map((r) => r.key.length)),
    Math.max(headers[1].length, ...rows.map((r) => r.envVar.length)),
    Math.max(headers[2].length, ...rows.map((r) => r.status.length)),
    Math.max(headers[3].length, ...rows.map((r) => r.rowCount.length)),
    Math.max(headers[4].length, ...rows.map((r) => r.schemaNotes.length)),
  ];

  const line = (cols: string[]) =>
    cols.map((c, i) => padRight(c, widths[i])).join("  ");

  console.log(line(headers));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const r of rows) {
    console.log(line([r.key, r.envVar, r.status, r.rowCount, r.schemaNotes]));
  }
}

// ─── Main ───────────────────────────────────────────────────────────
async function main() {
  if (!process.env.NOTION_API_KEY) {
    console.error("NOTION_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요.");
    process.exit(1);
  }

  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  console.log(`Probing ${DBS.length} Notion DBs (timeout ${QUERY_TIMEOUT_MS}ms each)...\n`);

  const results: ProbeResult[] = [];
  for (const spec of DBS) {
    process.stdout.write(`  ... ${spec.key} `);
    const r = await probe(notion, spec);
    process.stdout.write(`-> ${r.status}\n`);
    results.push(r);
  }

  console.log("");
  printTable(results);
  console.log("");

  // Summary
  const counters: Record<string, number> = {};
  for (const r of results) {
    const bucket = r.status.startsWith("FAIL") ? "FAIL" : r.status;
    counters[bucket] = (counters[bucket] ?? 0) + 1;
  }
  const driftCount = results.filter((r) => r.drift && r.status === "OK").length;

  const total = results.length;
  const okCount = counters["OK"] ?? 0;

  const parts: string[] = [];
  parts.push(`${okCount}/${total} OK`);
  for (const [k, v] of Object.entries(counters)) {
    if (k === "OK") continue;
    parts.push(`${v} ${k}`);
  }
  if (driftCount > 0) parts.push(`${driftCount} SCHEMA_DRIFT`);

  console.log(`Summary: ${parts.join(", ")}`);

  // Unhealthy details
  const unhealthy = results.filter(
    (r) => r.status !== "OK" || r.drift,
  );
  if (unhealthy.length) {
    console.log("\nUnhealthy DBs:");
    for (const r of unhealthy) {
      console.log(`  - ${r.key} (${r.envVar}): status=${r.status}; ${r.schemaNotes}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
