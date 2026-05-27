/**
 * 테스트 계정 5종을 Notion Members DB 에 생성합니다.
 *
 * - 각 역할별 1개씩 (회장단 / 국장팀장 / 국원 / 동아리장 / 회원)
 * - 동일 이메일이 이미 존재하면 SKIP
 * - 공통 비밀번호: TestPass1234! (bcryptjs, rounds=10)
 *
 * 실행: npx tsx scripts/create-test-accounts.ts
 */

import { resolve } from "path";
import { config } from "dotenv";
import { Client } from "@notionhq/client";
import bcrypt from "bcryptjs";

config({ path: resolve(process.cwd(), ".env.local") });

const NOTION_API_KEY = (process.env.NOTION_API_KEY || "").trim();
const MEMBERS_DB = (process.env.NOTION_MEMBERS_DB || "").trim();

if (!NOTION_API_KEY) {
  console.error("[ERROR] NOTION_API_KEY 가 .env.local 에 설정되지 않았습니다.");
  process.exit(1);
}
if (!MEMBERS_DB) {
  console.error("[ERROR] NOTION_MEMBERS_DB 가 .env.local 에 설정되지 않았습니다.");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

const COMMON_PASSWORD = "TestPass1234!";

type Role = "회장단" | "국장팀장" | "국원" | "동아리장" | "회원";

interface TestAccount {
  name: string;
  email: string;
  role: Role;
}

const ACCOUNTS: TestAccount[] = [
  { email: "chairperson@kentech.ac.kr", role: "회장단", name: "테스트회장" },
  { email: "manager@kentech.ac.kr", role: "국장팀장", name: "테스트국장" },
  { email: "staff@kentech.ac.kr", role: "국원", name: "테스트국원" },
  { email: "clubleader@kentech.ac.kr", role: "동아리장", name: "테스트동아리장" },
  { email: "member@kentech.ac.kr", role: "회원", name: "테스트회원" },
];

type Status = "CREATED" | "SKIPPED" | "FAILED";

interface Result {
  email: string;
  role: Role;
  status: Status;
  detail?: string;
}

async function findExisting(email: string): Promise<boolean> {
  const res = await notion.databases.query({
    database_id: MEMBERS_DB,
    filter: { property: "이메일", email: { equals: email } },
    page_size: 1,
  });
  return res.results.length > 0;
}

async function createAccount(acc: TestAccount, hashedPassword: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  await notion.pages.create({
    parent: { database_id: MEMBERS_DB },
    properties: {
      이름: { title: [{ text: { content: acc.name } }] },
      이메일: { email: acc.email },
      비밀번호: { rich_text: [{ text: { content: hashedPassword } }] },
      동아리: { rich_text: [{ text: { content: "" } }] },
      역할: { select: { name: acc.role } },
      가입일: { date: { start: today } },
    },
  });
}

async function main() {
  console.log(`=== 테스트 계정 ${ACCOUNTS.length}개 생성 시작 ===`);
  console.log(`Members DB: ${MEMBERS_DB}`);
  console.log("");

  const hashedPassword = await bcrypt.hash(COMMON_PASSWORD, 10);
  const results: Result[] = [];

  for (const acc of ACCOUNTS) {
    try {
      const exists = await findExisting(acc.email);
      if (exists) {
        console.log(`  [SKIP] ${acc.email} (${acc.role}) — already exists`);
        results.push({ email: acc.email, role: acc.role, status: "SKIPPED" });
        continue;
      }

      await createAccount(acc, hashedPassword);
      console.log(`  [OK]   ${acc.email} (${acc.role}) — created`);
      results.push({ email: acc.email, role: acc.role, status: "CREATED" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  [ERR]  ${acc.email} (${acc.role}) — ${msg}`);
      results.push({ email: acc.email, role: acc.role, status: "FAILED", detail: msg });
    }
  }

  console.log("");
  console.log("=== Summary ===");
  console.log("email                              | role       | status");
  console.log("-----------------------------------|------------|----------");
  for (const r of results) {
    const emailCol = r.email.padEnd(34, " ");
    const roleCol = r.role.padEnd(10, " ");
    console.log(`${emailCol} | ${roleCol} | ${r.status}`);
  }

  const failed = results.filter((r) => r.status === "FAILED");
  if (failed.length > 0) {
    console.log("");
    console.log("Failed details:");
    for (const f of failed) {
      console.log(`  - ${f.email}: ${f.detail}`);
    }
  }

  console.log("");
  console.log(`Shared password: ${COMMON_PASSWORD}`);
  console.log("");
}

main().catch((e) => {
  console.error("[FATAL]", e);
  process.exit(1);
});
