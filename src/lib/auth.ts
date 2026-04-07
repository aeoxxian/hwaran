import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { User } from "./types";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET 환경변수가 설정되지 않았습니다. .env.local을 확인하세요.");
  return secret;
}
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(user: Omit<User, "clubName">): string {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, clubId: user.clubId },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, getJwtSecret()) as User;
  } catch {
    return null;
  }
}
