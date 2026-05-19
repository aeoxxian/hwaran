# 화란 - KENTECH 동아리연합회 웹사이트

한국에너지공과대학교(KENTECH) 제4대 동아리연합회 '화란' 공식 웹사이트입니다.

## 기술 스택

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4
- **Backend/DB**: Notion API (`@notionhq/client`)
- **Auth**: bcryptjs + jsonwebtoken / jose (Edge JWT 검증)
- **Data Fetching**: SWR + Server Components
- **Storage**: AWS S3 (presigned URL 업로드)
- **Email**: SMTP (Nodemailer) - 결재/모더레이션 알림
- **Test**: Node 22 빌트인 test runner + tsx

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 아래 변수를 설정합니다. 일부가 비어 있으면 자동으로 목업/대체 모드로 동작합니다.

```dotenv
# Notion
NOTION_API_KEY=
NOTION_PARENT_PAGE_ID=
NOTION_MEMBERS_DB=
NOTION_NOTICES_DB=
NOTION_CLUBS_DB=
NOTION_CLUB_MEMBERS_DB=
NOTION_EVENTS_DB=
NOTION_QNA_DB=
NOTION_COMPLAINTS_DB=
NOTION_LOST_FOUND_DB=
NOTION_PROMOTIONS_DB=
NOTION_GALLERY_DB=
NOTION_DOCUMENTS_DB=
NOTION_INVENTORY_DB=
NOTION_BANNERS_DB=
NOTION_BOARD_COMMENTS_DB=
NOTION_DRAFTS_DB=
NOTION_APPLICATIONS_DB=
NOTION_NOTIFICATIONS_DB=

# Auth
JWT_SECRET=

# AWS S3
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
ADMIN_EMAIL=

# 배포 도메인
NEXT_PUBLIC_URL=http://localhost:3000
```

> 빈 환경변수는 그대로 두어도 사이트는 동작하지만, 운영 모드 표시는 `MOCK` 으로 떨어집니다. 헤더의 `NOTION LIVE / MOCK` 배지로 현재 상태를 확인할 수 있습니다.

### 3. Notion 데이터베이스 자동 생성 (선택)

```bash
# .env.local 에 NOTION_API_KEY 와 NOTION_PARENT_PAGE_ID 가 채워진 상태에서:
npm run setup:notion
```

생성된 DB ID 들이 `.env.local` 에 자동으로 추가됩니다. 노션 부모 페이지에 인테그레이션을 공유했는지 확인하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)

### 5. 빌드 / 검증

```bash
npm run lint     # ESLint
npm test         # 단위 테스트
npm run build    # 프로덕션 빌드
npm start        # 빌드된 서버 실행
```

## 운영 모드 표시

- 헤더 우측 `NOTION LIVE / MOCK` 배지로 현재 데이터 소스 확인
- `/api/status` 가 `mode`, 각 DB/JWT/S3/SMTP 의 설정 여부를 JSON 으로 반환
- 관리자 대시보드 (`/admin`) 의 운영 상태 카드에서 자세히 보기 가능

## 프로젝트 구조

```
src/
├── app/                       # Next.js App Router
│   ├── api/                   # API Routes (Notion / Auth / Admin / Status)
│   ├── auth/                  # 로그인/회원가입
│   ├── boards/                # 커뮤니티 (문의/민원/분실물/홍보)
│   ├── calendar/              # 캘린더
│   ├── clubs/                 # 동아리 소개/상세
│   ├── documents/ gallery/    # 자료실/갤러리
│   ├── inventory/ notices/    # 물품/공지
│   └── admin/                 # 관리자 포털 (대시보드/기안/서류/알림/공지/모더레이션)
├── components/
│   ├── admin/                 # 관리자 사이드바, 결재 타임라인, 알림 종, 운영상태 카드
│   ├── boards/                # 게시판 리스트/상세/에디터/댓글/모더레이션 로그
│   ├── common/                # 공통 컴포넌트 (RuntimeModeBadge 등)
│   └── layout/                # 헤더/푸터/네비게이션
├── context/                   # AuthContext
├── lib/
│   ├── api-auth.ts            # API 라우트 공통 인증/권한 가드
│   ├── auth.ts                # bcrypt/JWT
│   ├── data.ts                # 서버사이드 데이터 레이어 (Notion ↔ mock 폴백)
│   ├── notion.ts              # Notion 클라이언트 + 매핑 유틸
│   ├── email.ts               # SMTP 헬퍼
│   ├── constants.ts           # 네비/상태 상수
│   ├── mock-data.ts           # 목업 데이터
│   └── types.ts               # 도메인 타입 (UserRole, ModerationLog 등)
└── middleware.ts              # /admin/* 보호 (jose 기반 JWT 검증)
```

## 권한 모델

| 역할 | 레벨 | 권한 |
|------|------|------|
| `회원` / `동아리장` / `부동아리장` | 0 | 일반 사용자 |
| `국원` | 1 | 기안 작성/제출, 본인 글 관리 |
| `국장팀장` | 2 | 1차 결재, 모더레이션, 서류 검토 |
| `회장단` / `관리자` | 3 | 최종 결재, 공지 작성, 모든 글 관리 |

`src/lib/api-auth.ts` 의 `guard()` / `canManageResource()` 가 모든 API 권한 검사를 담당합니다.

## 주요 기능

| 기능 | 설명 |
|------|------|
| 메인 페이지 | 중요 공지, 다가오는 일정 캘린더, 빠른 메뉴, 외부 채널 |
| 공지사항 | 중요 고정, 첨부파일, 관리자 CRUD |
| 동아리 소개 | 카테고리 필터, 구성원, 인스타 링크 |
| 캘린더 | 월간 뷰, 동아리별 색상, 일정 상세 |
| 커뮤니티 | 문의(Q&A) / 민원 / 분실물 / 홍보 — 글/댓글/첨부, 관리자 모더레이션, 모더레이션 로그 |
| 갤러리/자료실/물품 | 앨범/문서/물품 관리 |
| 인증 | 회원가입/로그인, bcrypt + JWT, Edge 미들웨어 |
| 관리자 포털 | 대시보드, 기안 결재 흐름, 서류신청 검토, 공지 작성, 알림 |
| 알림 | 결재/모더레이션/공지 알림, 단일/전체 읽음 처리 (Notion DB 동기화) |
| 운영 상태 | `/api/status` + 헤더 배지 + 대시보드 카드 |
| 모더레이션 | 승인/반려/해결/대기 + 사유 입력 + 이력 보존 |

## 테스트

```bash
npm test
```

`tests/unit/*.test.ts` 에 정의된 단위 테스트가 Node 빌트인 러너로 실행됩니다. 테스트 파일은 `tsx` 로더를 통해 TypeScript 그대로 실행됩니다.

추가 시나리오는 `docs/RELEASE_CHECKLIST.md` 의 절차를 따르세요.

## 배포

- **임시 공유**: Vercel 배포가 가장 빠릅니다. (`vercel`, `vercel deploy --prod`)
- **AWS**: Amplify 또는 EC2 + standalone Next.js 빌드 권장
- 배포 후 `/api/status` 가 `mode: "notion-live"` 인지 반드시 확인하세요.
- 자세한 사항은 `docs/RELEASE_CHECKLIST.md` 참고.

## 문서

- [`docs/RELEASE_CHECKLIST.md`](./docs/RELEASE_CHECKLIST.md) - 발표/배포 체크리스트
