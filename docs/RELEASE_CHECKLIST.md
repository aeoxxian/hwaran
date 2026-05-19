# 릴리즈 체크리스트

발표/배포 전 마지막으로 확인해야 할 항목입니다. 항목별로 체크하고 모두 통과하면 배포를 진행합니다.

## 1. 빌드 & 타입 검사

- [ ] `npm run lint` - ESLint 에러 0
- [ ] `npx tsc --noEmit` - TypeScript 에러 0
- [ ] `npm run build` - Next.js 프로덕션 빌드 성공
- [ ] `npm test` - 단위 테스트 전부 통과

## 2. 환경 변수 (Production)

- [ ] `NOTION_API_KEY` 가 운영용 인테그레이션 키로 설정됨
- [ ] 모든 `NOTION_*_DB` 환경변수가 운영 DB ID 로 설정됨 (`/api/status` 응답으로 확인)
- [ ] `JWT_SECRET` 이 충분히 긴 무작위 문자열로 설정됨 (32자 이상)
- [ ] `AWS_S3_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` 가 모두 설정됨
- [ ] `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `ADMIN_EMAIL` 이 설정됨
- [ ] `NEXT_PUBLIC_URL` 이 실제 도메인으로 설정됨 (Notion 알림 링크에 사용됨)

## 3. Notion 워크스페이스 사전 확인

- [ ] `setup:notion` 으로 생성된 모든 DB 가 인테그레이션에 공유되어 있음
- [ ] `Members` DB 의 `역할` 셀렉트 옵션에 `회장단 / 국장팀장 / 국원 / 관리자 / 동아리장 / 부동아리장 / 회원` 이 모두 존재함
- [ ] 첫 관리자 계정의 `역할` 이 `회장단` 또는 `관리자` 로 설정됨

## 4. 시나리오 검증

발표 전에 한 번씩 실행해 동작을 확인합니다.

- [ ] 회원가입 → 기본 역할 `회원` 으로 생성
- [ ] 관리자 계정으로 로그인 → 헤더에 `관리자` 메뉴 노출, `NOTION LIVE` 배지 노출
- [ ] `/admin` 대시보드의 운영 상태 카드가 `Notion LIVE / DB n/n` 으로 표시됨
- [ ] 일반 사용자가 `커뮤니티`(`/boards`) 에 글 작성 → 목록/상세 노출
- [ ] 일반 사용자가 다른 사람의 글에 댓글 작성 가능
- [ ] 다른 사용자가 작성한 글의 수정/삭제 버튼이 비노출
- [ ] 관리자(`국장팀장 +`) 가 모더레이션(승인/반려/대기/해결) 가능, 반려 시 사유 필수
- [ ] 모더레이션 이력이 게시글 상세에서 관리자에게만 노출됨
- [ ] 관리자(`국원 +`) 가 기안을 작성/제출하면 알림이 다음 결재자에게 전달됨
- [ ] `회장단` 의 최종 승인까지 결재 흐름이 정상 종료됨
- [ ] 알림 종 아이콘에서 단일/전체 읽음 처리가 정상 동작함

## 5. 권한 경계

- [ ] 비로그인 상태에서 `/admin/*` 접근 시 `/auth/login` 으로 리다이렉트 됨 (middleware)
- [ ] 일반 회원으로 `/api/admin/*` 호출 시 403 응답
- [ ] 다른 사람 글에 대한 PATCH/DELETE 요청이 403 응답
- [ ] `/api/admin/boards/[id]/moderation` PATCH 가 `국장팀장 +` 만 허용

## 6. 운영 안전장치

- [ ] `.env.local` 이 `git` 히스토리에 포함되지 않음 (`git status` / `git log .env.local` 확인)
- [ ] AWS 자격 증명이 IAM 사용자 단위로 분리되어 있음 (S3 PUT 만 허용)
- [ ] SMTP 발신용 계정이 OAuth 토큰/앱 비밀번호로 발급됨

## 7. 배포 후

- [ ] 도메인에서 `/api/status` 가 `mode: "notion-live"` 를 반환
- [ ] `Health Check` 가 200 OK 응답
- [ ] 첫 관리자 로그인 후 더미 글/공지를 한 번 작성/삭제하여 DB 권한 정상 확인

---

문제 발생 시: `mock` 모드로 자동 폴백되므로 `/api/status` 의 `databases` 항목과 `Notion API Key` 보유 여부를 먼저 확인하세요.
