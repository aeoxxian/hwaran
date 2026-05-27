import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "./auth";
import { getAdminLevel } from "./types";
import type { User } from "./types";

/**
 * Server-side admin guard for App Router server components.
 * - No cookie / invalid token → redirect to /auth/login.
 * - Authenticated user with insufficient level → redirect to /admin.
 *   (Plain users without any admin role are already filtered by middleware.ts;
 *    this exists to differentiate among admin roles, e.g. L1 vs L2.)
 * Returns the verified User on success.
 *
 * Pair this with the API-level guard in api-auth.ts — middleware only checks
 * role MEMBERSHIP in ADMIN_ROLES, not minLevel, so SSR pages reachable to
 * any admin role need this if they expose level-2+ data.
 */
export async function requireAdminLevel(minLevel: number): Promise<User> {
  const jar = await cookies();
  const token = jar.get("hwaran-token")?.value;
  if (!token) {
    redirect("/auth/login");
  }
  const user = verifyToken(token);
  if (!user) {
    redirect("/auth/login");
  }
  if (getAdminLevel(user.role) < minLevel) {
    redirect("/admin");
  }
  return user;
}
