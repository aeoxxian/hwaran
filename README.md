# 화란 - KENTECH 동아리연합회 웹사이트

한국에너지공과대학교(KENTECH) 제4대 동아리연합회 '화란' 공식 웹사이트입니다.

## 기술 스택

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4
- **Backend/DB**: Notion API (`@notionhq/client`)
- **Auth**: bcryptjs + jsonwebtoken
- **Data Fetching**: SWR

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 아래 변수를 설정합니다:

```
NOTION_API_KEY=your_notion_api_key
NOTION_MEMBERS_DB=your_db_id
NOTION_NOTICES_DB=your_db_id
NOTION_CLUBS_DB=your_db_id
NOTION_CLUB_MEMBERS_DB=your_db_id
NOTION_EVENTS_DB=your_db_id
NOTION_QNA_DB=your_db_id
NOTION_COMPLAINTS_DB=your_db_id
NOTION_LOST_FOUND_DB=your_db_id
NOTION_PROMOTIONS_DB=your_db_id
NOTION_GALLERY_DB=your_db_id
NOTION_DOCUMENTS_DB=your_db_id
NOTION_INVENTORY_DB=your_db_id
NOTION_BANNERS_DB=your_db_id
JWT_SECRET=your_jwt_secret
```

> Notion API 키가 없으면 자동으로 목업 데이터로 동작합니다.

### 3. Notion 데이터베이스 자동 생성 (선택)

```bash
# .env.local에 NOTION_API_KEY와 NOTION_PARENT_PAGE_ID를 먼저 설정한 뒤:
npx tsx scripts/setup-notion-dbs.ts
```

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 5. 프로덕션 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── api/               # API Routes (Notion 연동)
│   ├── auth/              # 로그인/회원가입
│   ├── boards/            # 게시판 (문의/민원/분실물/홍보)
│   ├── calendar/          # 캘린더
│   ├── clubs/             # 동아리 소개
│   ├── documents/         # 자료실
│   ├── gallery/           # 갤러리
│   ├── inventory/         # 물품 관리
│   └── notices/           # 공지사항
├── components/            # React 컴포넌트
│   ├── home/             # 메인 페이지 컴포넌트
│   └── layout/           # 헤더/푸터/네비게이션
├── lib/                   # 유틸리티
│   ├── auth.ts           # 인증 (bcrypt/JWT)
│   ├── constants.ts      # 상수
│   ├── mock-data.ts      # 목업 데이터
│   ├── notion.ts         # Notion 클라이언트
│   └── types.ts          # TypeScript 타입
└── public/               # 정적 파일
```

## 주요 기능

| 기능 | 설명 |
|------|------|
| 메인 페이지 | 동아리 배너 슬라이드, 중요 공지, 다가오는 일정, 외부 채널 |
| 공지사항 | 중요 공지 고정, 목록/상세, 관리자 CRUD |
| 동아리 소개 | 카테고리 필터, 상세 페이지, 구성원 소개, 인스타그램 링크 |
| 캘린더 | 월간 뷰, 동아리별 색상 구분, 일정 상세 |
| 게시판 | 문의(Q&A), 민원, 분실물, 동아리 홍보글 |
| 갤러리 | 행사별 앨범 그리드, 이미지 뷰어 |
| 자료실 | 회칙/양식/회의록 분류, 파일 다운로드 |
| 물품 관리 | 물품 현황, 상태별 통계 |
| 인증 | 회원가입/로그인, bcrypt 암호화, JWT |

## 배포 (AWS)

Standalone 모드로 빌드하여 AWS EC2 또는 Amplify에 배포할 수 있습니다.

```bash
npm run build
npm start
```
