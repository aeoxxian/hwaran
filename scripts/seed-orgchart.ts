/**
 * mock-data 의 OrgChart 명단을 라이브 Notion OrgChart DB 에 시드합니다.
 *
 * - 기존 DB 가 비어 있을 때만 실행 (멱등성 보장).
 * - 이미 데이터가 있으면 SKIP 하고 종료.
 */

import { resolve } from "path";
import { config } from "dotenv";
import { Client } from "@notionhq/client";

config({ path: resolve(process.cwd(), ".env.local") });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dbId = (process.env.NOTION_ORGCHART_DB || "").trim();

// mock-data.ts 와 동일한 명단 (의존성을 줄이기 위해 인라인 복제)
const SEED = [
  { name: "김서정", title: "동아리연합회장", department: "회장단", order: 1 },
  { name: "박은규", title: "동아리연합부회장", department: "회장단", order: 2 },
  { name: "서민재", title: "국장", department: "행사기획국", order: 10 },
  { name: "송정후", title: "국원", department: "행사기획국", order: 11 },
  { name: "김윤서", title: "국원", department: "행사기획국", order: 12 },
  { name: "전은비", title: "국장", department: "사무국", order: 20 },
  { name: "이승훈", title: "국원", department: "사무국", order: 21 },
  { name: "김도유", title: "국원", department: "사무국", order: 22 },
  { name: "안정웅", title: "국원", department: "사무국", order: 23 },
  { name: "이서빈", title: "국장", department: "홍보디자인국", order: 30 },
  { name: "남은수", title: "팀장", department: "홍보디자인국", team: "디자인팀", order: 31 },
  { name: "장준형", title: "팀원", department: "홍보디자인국", team: "디자인팀", order: 32 },
  { name: "조윤서", title: "팀원", department: "홍보디자인국", team: "디자인팀", order: 33 },
  { name: "김승우", title: "팀장", department: "홍보디자인국", team: "웹사이트 개발팀", order: 34 },
  { name: "고이삭", title: "팀원", department: "홍보디자인국", team: "웹사이트 개발팀", order: 35 },
  { name: "김현우", title: "팀원", department: "홍보디자인국", team: "웹사이트 개발팀", order: 36 },
  { name: "최민", title: "국원", department: "홍보디자인국", order: 37 },
  { name: "송현우", title: "국장", department: "동아리관리국", order: 40 },
  { name: "노윤서", title: "팀장", department: "동아리관리국", team: "대내업무팀", order: 41 },
  { name: "송은율", title: "팀원", department: "동아리관리국", team: "대내업무팀", order: 42 },
  { name: "황아진", title: "팀원", department: "동아리관리국", team: "대내업무팀", order: 43 },
  { name: "주예슬", title: "팀장", department: "동아리관리국", team: "대외업무팀", order: 44 },
  { name: "백시연", title: "팀원", department: "동아리관리국", team: "대외업무팀", order: 45 },
  { name: "이중헌", title: "팀원", department: "동아리관리국", team: "대외업무팀", order: 46 },
];

async function main() {
  if (!dbId) {
    console.error("NOTION_ORGCHART_DB 가 .env.local 에 설정되지 않았습니다.");
    process.exit(1);
  }
  // 이미 데이터가 있으면 중복 생성 방지
  const existing = await notion.databases.query({ database_id: dbId, page_size: 1 });
  if (existing.results.length > 0) {
    console.log("이미 OrgChart DB 에 데이터가 있습니다. 시드를 건너뜁니다.");
    console.log("재시드가 필요하면 Notion 에서 페이지를 모두 삭제한 후 다시 실행하세요.");
    return;
  }

  console.log(`OrgChart DB 에 ${SEED.length}명 시드 시작...`);
  let success = 0;
  for (const m of SEED) {
    try {
      const properties: Record<string, unknown> = {
        이름: { title: [{ text: { content: m.name } }] },
        직책: { rich_text: [{ text: { content: m.title } }] },
        부서: { rich_text: [{ text: { content: m.department } }] },
        순서: { number: m.order },
      };
      if (m.team) {
        properties["팀"] = { rich_text: [{ text: { content: m.team } }] };
      }
      await notion.pages.create({
        parent: { database_id: dbId },
        properties: properties as Parameters<typeof notion.pages.create>[0]["properties"],
      });
      success++;
      console.log(`  [OK] ${m.name} (${m.department}${m.team ? `/${m.team}` : ""})`);
    } catch (e) {
      console.error(`  [ERR] ${m.name}:`, e);
    }
  }
  console.log(`\n=== 완료: ${success}/${SEED.length} 명 등록됨 ===`);
}

main().catch((e) => { console.error(e); process.exit(1); });
