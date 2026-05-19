import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAdminLevel } from "@/lib/types";
import type { User } from "@/lib/types";

/**
 * API Route 공통 인증/권한 헬퍼
 * - 모든 보호된 엔드포인트에서 동일한 정책을 사용하여 권한 경계의 일관성을 보장합니다.
 */

export function getCurrentUser(request: NextRequest): User | null {
  const token = request.cookies.get("hwaran-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export type GuardResult =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse };

interface GuardOptions {
  /** 최소 관리자 레벨 (1=국원, 2=국장팀장, 3=회장단). 0이면 일반 로그인만 요구. */
  minAdminLevel?: 0 | 1 | 2 | 3;
}

/**
 * 인증/권한 가드
 * - 토큰이 없거나 위변조면 401, 권한 부족이면 403을 반환합니다.
 */
export function guard(request: NextRequest, options: GuardOptions = {}): GuardResult {
  const user = getCurrentUser(request);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }),
    };
  }

  const minLevel = options.minAdminLevel ?? 0;
  if (minLevel > 0 && getAdminLevel(user.role) < minLevel) {
    return {
      ok: false,
      response: NextResponse.json({ error: "권한이 없습니다." }, { status: 403 }),
    };
  }

  return { ok: true, user };
}

/**
 * 작성자 본인 또는 관리자(레벨 ≥ minAdminLevel)인지 검사합니다.
 */
export function canManageResource(
  user: User,
  authorId: string | undefined,
  minAdminLevel: 1 | 2 | 3 = 1,
): boolean {
  if (!authorId) return getAdminLevel(user.role) >= minAdminLevel;
  if (user.id === authorId) return true;
  return getAdminLevel(user.role) >= minAdminLevel;
}
