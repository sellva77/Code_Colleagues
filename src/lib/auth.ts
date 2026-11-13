import crypto from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "cc_session";

function secret() {
  return process.env.ADMIN_SECRET || "";
}

export function passwordOk(input: string) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || !input) return false;
  const actualHash = crypto.createHash("sha256").update(input).digest();
  const expectedHash = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(actualHash, expectedHash);
}

export function emailOk(input: string) {
  const expected = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  return expected.length > 0 && input.trim().toLowerCase() === expected;
}

export function signSession() {
  const payload = Buffer.from(
    JSON.stringify({ role: "admin", exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }),
  ).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined) {
  if (!token || !secret()) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  const actualBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (actualBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(actualBuf, expectedBuf)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      role?: string;
      exp?: number;
    };
    return data.role === "admin" && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export async function isAuthed() {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

const loginHits = new Map<string, number[]>();

export function loginLimited(ip: string) {
  const now = Date.now();
  const recent = (loginHits.get(ip) || []).filter((time) => now - time < 15 * 60 * 1000);
  if (recent.length >= 8) {
    loginHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  loginHits.set(ip, recent);
  return false;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
