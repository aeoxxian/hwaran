import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { User } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "hwaran-default-secret-change-me";
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
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User;
  } catch {
    return null;
  }
}
