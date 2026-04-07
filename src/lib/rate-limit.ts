/**
 * 인메모리 Rate Limiter
 * Vercel Serverless 환경에서도 기본적인 방어를 제공합니다.
 * (인스턴스별로 독립 동작하므로 완벽하지 않지만, 기본 방어에 충분)
 * 
 * 프로덕션에서는 Redis 기반으로 교체할 수 있는 인터페이스입니다.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// 오래된 항목 정리 (5분마다)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 60_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 5 * 60_000);

/**
 * Rate limit 체크
 * @param identifier - IP 주소 또는 사용자 ID
 * @param maxRequests - 윈도우 내 최대 요청 수
 * @param windowMs - 시간 윈도우 (밀리초, 기본 60초)
 * @returns { success: boolean, remaining: number, resetMs: number }
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number = 60_000,
): { success: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const entry = store.get(identifier) || { timestamps: [] };

  // 윈도우 밖의 timestamp 제거
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    return {
      success: false,
      remaining: 0,
      resetMs: oldestInWindow + windowMs - now,
    };
  }

  entry.timestamps.push(now);
  store.set(identifier, entry);

  return {
    success: true,
    remaining: maxRequests - entry.timestamps.length,
    resetMs: windowMs,
  };
}

/**
 * NextRequest에서 클라이언트 IP를 추출
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

/**
 * Rate limit 초과 시 응답 생성
 */
export function rateLimitResponse(resetMs: number) {
  return new Response(
    JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil(resetMs / 1000)),
      },
    },
  );
}
