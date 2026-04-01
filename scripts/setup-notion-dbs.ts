/**
 * Notion 데이터베이스 초기 설정 스크립트
 *
 * 사용법:
 * 1. .env.local에 NOTION_API_KEY와 NOTION_PARENT_PAGE_ID를 설정
 * 2. npx tsx scripts/setup-notion-dbs.ts
 *
 * 참고: Next.js는 .env.local을 자동으로 읽지만, tsx로 이 스크립트만 실행할 때는
 * 읽지 않으므로 아래에서 dotenv로 명시적으로 로드합니다.
 *
 * 이 스크립트는 데이터베이스를 자동으로 생성하고,
 * 생성된 DB ID를 .env.local에 추가해야 합니다.
 */

import { resolve } from "path";
import { config } from "dotenv";
import { Client } from "@notionhq/client";

config({ path: resolve(process.cwd(), ".env.local") });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const parentPageId = process.env.NOTION_PARENT_PAGE_ID || "";

interface DbConfig {
  envKey: string;
  title: string;
  properties: Record<string, unknown>;
}

const databases: DbConfig[] = [
  {
    envKey: "NOTION_MEMBERS_DB",
    title: "회원 (Members)",
    properties: {
      이름: { title: {} },
      이메일: { email: {} },
      비밀번호: { rich_text: {} },
      동아리: { rich_text: {} },
      역할: {
        select: {
          options: [
            { name: "회장단" },
            { name: "국장팀장" },
            { name: "국원" },
            { name: "관리자" },
            { name: "동아리장" },
            { name: "부동아리장" },
            { name: "회원" },
          ],
        },
      },
      가입일: { date: {} },
    },
  },
  {
    envKey: "NOTION_NOTICES_DB",
    title: "공지사항 (Notices)",
    properties: {
      제목: { title: {} },
      내용: { rich_text: {} },
      작성자: { rich_text: {} },
      작성일: { date: {} },
      중요여부: { checkbox: {} },
      첨부파일: { files: {} },
    },
  },
  {
    envKey: "NOTION_CLUBS_DB",
    title: "동아리 (Clubs)",
    properties: {
      이름: { title: {} },
      소개: { rich_text: {} },
      로고: { files: {} },
      인스타그램: { url: {} },
      배너이미지: { files: {} },
      분류: { select: { options: [{ name: "학술" }, { name: "공연" }, { name: "봉사" }, { name: "체육" }, { name: "문화" }, { name: "종교" }] } },
      회원수: { number: {} },
    },
  },
  {
    envKey: "NOTION_CLUB_MEMBERS_DB",
    title: "동아리 구성원 (Club Members)",
    properties: {
      이름: { title: {} },
      역할: { select: { options: [{ name: "회장" }, { name: "부회장" }, { name: "회원" }] } },
      소개: { rich_text: {} },
      프로필사진: { files: {} },
      동아리ID: { rich_text: {} },
    },
  },
  {
    envKey: "NOTION_EVENTS_DB",
    title: "일정 (Events)",
    properties: {
      제목: { title: {} },
      시작일: { date: {} },
      종료일: { date: {} },
      동아리ID: { rich_text: {} },
      동아리명: { rich_text: {} },
      장소: { rich_text: {} },
      설명: { rich_text: {} },
      색상: { rich_text: {} },
    },
  },
  {
    envKey: "NOTION_QNA_DB",
    title: "문의 게시판 (QnA)",
    properties: {
      제목: { title: {} },
      내용: { rich_text: {} },
      작성자: { rich_text: {} },
      작성일: { date: {} },
      답변: { rich_text: {} },
      답변일: { date: {} },
      상태: { select: { options: [{ name: "대기" }, { name: "답변완료" }] } },
    },
  },
  {
    envKey: "NOTION_COMPLAINTS_DB",
    title: "민원 게시판 (Complaints)",
    properties: {
      제목: { title: {} },
      내용: { rich_text: {} },
      작성자: { rich_text: {} },
      작성일: { date: {} },
      상태: { select: { options: [{ name: "대기" }, { name: "해결" }] } },
      익명여부: { checkbox: {} },
    },
  },
  {
    envKey: "NOTION_LOST_FOUND_DB",
    title: "분실물 (Lost & Found)",
    properties: {
      제목: { title: {} },
      설명: { rich_text: {} },
      이미지: { files: {} },
      장소: { rich_text: {} },
      상태: { select: { options: [{ name: "미해결" }, { name: "해결" }] } },
      작성자: { rich_text: {} },
      작성일: { date: {} },
    },
  },
  {
    envKey: "NOTION_PROMOTIONS_DB",
    title: "홍보글 (Promotions)",
    properties: {
      제목: { title: {} },
      내용: { rich_text: {} },
      동아리ID: { rich_text: {} },
      동아리명: { rich_text: {} },
      작성자: { rich_text: {} },
      작성일: { date: {} },
      이미지: { files: {} },
    },
  },
  {
    envKey: "NOTION_GALLERY_DB",
    title: "갤러리 (Gallery)",
    properties: {
      행사명: { title: {} },
      날짜: { date: {} },
      설명: { rich_text: {} },
      이미지: { files: {} },
      동아리ID: { rich_text: {} },
      동아리명: { rich_text: {} },
    },
  },
  {
    envKey: "NOTION_DOCUMENTS_DB",
    title: "자료 (Documents)",
    properties: {
      제목: { title: {} },
      분류: { select: { options: [{ name: "회칙" }, { name: "양식" }, { name: "회의록" }, { name: "기타" }] } },
      파일: { files: {} },
      작성일: { date: {} },
    },
  },
  {
    envKey: "NOTION_INVENTORY_DB",
    title: "물품 (Inventory)",
    properties: {
      이름: { title: {} },
      수량: { number: {} },
      상태: { select: { options: [{ name: "사용가능" }, { name: "대여중" }, { name: "수리중" }, { name: "폐기" }] } },
      보관위치: { rich_text: {} },
      비고: { rich_text: {} },
    },
  },
  {
    envKey: "NOTION_BANNERS_DB",
    title: "배너 (Banners)",
    properties: {
      동아리명: { title: {} },
      동아리ID: { rich_text: {} },
      이미지: { files: {} },
      링크: { url: {} },
      활성여부: { checkbox: {} },
    },
  },
  {
    envKey: "NOTION_BOARD_COMMENTS_DB",
    title: "게시판 댓글 (BoardComments)",
    properties: {
      게시글ID: { rich_text: {} },
      내용: { rich_text: {} },
      작성자ID: { rich_text: {} },
      작성자명: { rich_text: {} },
      작성자역할: { rich_text: {} },
      관리자댓글여부: { checkbox: {} },
      작성일: { date: {} },
    },
  },
  // ─── 관리자 포털 DB ───────────────────────────────────────
  {
    envKey: "NOTION_DRAFTS_DB",
    title: "기안 (Drafts)",
    properties: {
      제목: { title: {} },
      내용: { rich_text: {} },
      유형: { select: { options: [{ name: "예산" }, { name: "동아리등록" }, { name: "물품사용" }, { name: "기타" }] } },
      상태: { select: { options: [{ name: "임시저장" }, { name: "1차검토중" }, { name: "최종검토중" }, { name: "승인" }, { name: "반려" }] } },
      작성자ID: { rich_text: {} },
      작성자명: { rich_text: {} },
      작성자역할: { select: { options: [{ name: "국원" }, { name: "국장팀장" }, { name: "회장단" }] } },
      현재결재자역할: { select: { options: [{ name: "국장팀장" }, { name: "회장단" }] } },
      첨부파일: { files: {} },
      작성일: { date: {} },
      수정일: { date: {} },
    },
  },
  {
    envKey: "NOTION_APPLICATIONS_DB",
    title: "서류신청 (ClubApplications)",
    properties: {
      제목: { title: {} },
      유형: { select: { options: [{ name: "예산" }, { name: "동아리등록" }, { name: "물품사용" }, { name: "기타" }] } },
      동아리명: { rich_text: {} },
      제출자: { rich_text: {} },
      제출일: { date: {} },
      상태: { select: { options: [{ name: "대기" }, { name: "1차검토중" }, { name: "최종검토중" }, { name: "승인" }, { name: "반려" }] } },
      첨부파일: { files: {} },
      검토의견: { rich_text: {} },
      검토일: { date: {} },
      검토자: { rich_text: {} },
    },
  },
  {
    envKey: "NOTION_NOTIFICATIONS_DB",
    title: "알림 (Notifications)",
    properties: {
      제목: { title: {} },
      메시지: { rich_text: {} },
      수신자ID: { rich_text: {} },
      링크: { url: {} },
      읽음여부: { checkbox: {} },
      생성일: { date: {} },
      유형: { select: { options: [{ name: "기안" }, { name: "서류신청" }, { name: "공지" }, { name: "기타" }] } },
    },
  },
];

async function main() {
  if (!process.env.NOTION_API_KEY) {
    console.error("NOTION_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요.");
    process.exit(1);
  }
  if (!parentPageId) {
    console.error("NOTION_PARENT_PAGE_ID가 설정되지 않았습니다. .env.local에 추가하세요.");
    process.exit(1);
  }

  console.log("Notion 데이터베이스 생성을 시작합니다...\n");

  const results: Record<string, string> = {};

  for (const db of databases) {
    try {
      const response = await notion.databases.create({
        parent: { type: "page_id", page_id: parentPageId },
        title: [{ type: "text", text: { content: db.title } }],
        properties: db.properties as Parameters<typeof notion.databases.create>[0]["properties"],
      });
      results[db.envKey] = response.id;
      console.log(`  [OK] ${db.title} -> ${response.id}`);
    } catch (err) {
      console.error(`  [ERR] ${db.title}:`, err);
    }
  }

  console.log("\n=== .env.local에 아래 값들을 추가하세요 ===\n");
  for (const [key, value] of Object.entries(results)) {
    console.log(`${key}=${value}`);
  }
}

main();
