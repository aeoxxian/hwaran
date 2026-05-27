# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

화란 — KENTECH 제4대 동아리연합회 (Korea Institute of Energy Technology student-club federation) website. Next.js 15 App Router site backed by Notion as the database, with bcrypt/JWT auth, S3 uploads, and SMTP notifications.

UI strings, role names, Notion property names (e.g. `제목`, `작성일`, `중요여부`), and code comments are Korean and must stay Korean — they're matched literally against the Notion schema and rendered to users.

## Commands

```bash
npm run dev               # Next dev server with Turbopack
npm run build             # Production build (output: standalone)
npm start                 # Serve the built app
npm run lint              # ESLint (next/core-web-vitals + next/typescript)
npm test                  # Node 22 built-in test runner via tsx loader
npm run test:watch        # Same, watch mode
npm run setup:notion      # One-time: create Notion DBs and append IDs to .env.local

# Single test file
node --import tsx --test tests/unit/api-auth.test.ts

# Single test by name (Node test runner)
node --import tsx --test --test-name-pattern="canManageResource" tests/unit/api-auth.test.ts

# TS-only check (used by release checklist; tsconfig excludes scripts/ and tests/)
npx tsc --noEmit
```

Tests live in `tests/unit/*.test.ts` and use `node:test` + `node:assert/strict`. `tsconfig.json` excludes `scripts/` and `tests/` from the Next build, so test/script files run via `tsx` rather than the project's typecheck.

## Mock vs. live mode

The site runs without any env vars. `src/lib/data.ts` checks `process.env.NOTION_API_KEY`; if missing — or if a per-resource `databaseIds.<x>` is empty, or a Notion call throws — it transparently falls back to `src/lib/mock-data.ts`. The header `RuntimeModeBadge` and `GET /api/status` (`src/app/api/status/route.ts`) expose the current mode (`mock` vs `notion-live`) plus per-DB / JWT / S3 / SMTP configuration flags. When debugging "missing data" symptoms, hit `/api/status` first.

Each new data resource should follow the same pattern in `src/lib/data.ts`: `USE_MOCK || !databaseIds.<x>` short-circuit, `try/catch` around the Notion call returning mock data on error, and a `mapNotionToX(p)` helper using the `getTextProperty / getFilesProperty / getRelationIds` utilities in `src/lib/notion.ts`.

## Auth & permissions architecture

Two parallel JWT verifiers exist by design — do not consolidate:

- `src/lib/auth.ts` — Node runtime, uses `jsonwebtoken`. Used by API routes / server code.
- `src/middleware.ts` — Edge runtime, uses `jose.jwtVerify`. Guards `/admin/:path*`, redirects to `/auth/login?redirect=…` on missing/invalid token or non-admin role.

The token cookie is `hwaran-token` and the payload shape is `User` from `src/lib/types.ts`.

Role hierarchy (`getAdminLevel` in `src/lib/types.ts`):

| Role                              | Level |
|-----------------------------------|-------|
| `회원`, `동아리장`, `부동아리장`  | 0     |
| `국원`                            | 1     |
| `국장팀장`                        | 2     |
| `회장단`, `관리자`                | 3     |

`관리자` is a legacy value from the Notion setup script and is treated as equivalent to `회장단` (level 3) — see `roleMatchesReviewer` for the compatibility check used by the approval flow.

Every protected API route MUST go through `src/lib/api-auth.ts`:

- `guard(request, { minAdminLevel })` returns `{ ok: true, user }` or `{ ok: false, response }`. Return the response directly.
- `canManageResource(user, authorId, minAdminLevel)` is the "author-or-admin" check for PATCH/DELETE on user-authored content.

Tested behaviour lives in `tests/unit/api-auth.test.ts` — extend that file when changing the policy.

## Approval workflow (drafts)

Draft state machine is driven entirely by two maps in `src/lib/constants.ts`:

- `NEXT_REVIEWER`: `국원 → 국장팀장 → 회장단`
- `SUBMIT_STATUS`: what status a draft lands in when each role submits it

Approving (`action: "승인"`) advances `currentReviewerRole` to `NEXT_REVIEWER[user.role]`; if there's no next reviewer, status becomes `승인`. The `/api/admin/drafts/[id]` PATCH handler is the canonical implementation — mirror its mock-vs-live branching when adding new approval actions.

## Notion mapping conventions

- Notion property names in `getTextProperty(p, "제목")` etc. are Korean and match the schema created by `scripts/setup-notion-dbs.ts`. Renaming a property requires updating both the setup script AND every `mapNotionToX` caller.
- `getTextProperty` normalizes title / rich_text / select / date / number / checkbox / url / email / phone into a `string` — booleans come back as `"true"`/`"false"`, so compare with `=== "true"`.
- Notion page IDs are used directly as resource IDs throughout the app; don't generate your own IDs for Notion-backed resources.

## Project layout (only non-obvious parts)

- `src/app/api/admin/*` — admin-only routes. Always call `guard(request, { minAdminLevel: ≥1 })`.
- `src/lib/data.ts` — single server-side data layer used by both API routes and Server Components. Don't call the Notion client from components directly.
- `src/lib/email.ts` — SMTP helper for approval / moderation notifications. Silently no-ops if SMTP env vars are unset.
- `src/lib/rate-limit.ts` — in-memory limiter used for write endpoints.
- `scripts/setup-notion-dbs.ts` — creates all Notion DBs under `NOTION_PARENT_PAGE_ID` and writes IDs to `.env.local`. Requires the integration to be shared with the parent page.
- `scripts/migrate-notion.ts` — incremental schema additions for **existing** deployments (new DBs and new properties on existing DBs). Use this instead of re-running `setup:notion`, which would create duplicate databases. Repo also contains one-off scripts for OrgChart (`seed-orgchart.ts`, `migrate-orgchart-order.ts`, `check-orgchart.ts`).

## Release verification

`docs/RELEASE_CHECKLIST.md` is the source of truth for pre-deploy checks. Before claiming a feature is done, the relevant section (permissions, approval flow, moderation, `/api/status`) should be re-verified.
