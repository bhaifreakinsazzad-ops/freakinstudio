import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "fs_guest_session";
let ephemeralSecret: string | null = null;

function getCookieSecret(): string {
  if (process.env.AI_GUEST_COOKIE_SECRET && process.env.AI_GUEST_COOKIE_SECRET.length >= 16) {
    return process.env.AI_GUEST_COOKIE_SECRET;
  }
  if (!ephemeralSecret) {
    ephemeralSecret = randomBytes(32).toString("hex");
  }
  return ephemeralSecret;
}

function signSessionId(sessionId: string): string {
  const sig = createHmac("sha256", getCookieSecret()).update(sessionId).digest("hex");
  return `${sessionId}.${sig}`;
}

function verifySignedToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [sessionId, sigHex] = parts;
  if (!sessionId || !sigHex || !/^[a-f0-9]{16,64}$/i.test(sessionId)) {
    return null;
  }
  const expectedHex = createHmac("sha256", getCookieSecret())
    .update(sessionId)
    .digest("hex");
  const actualBuf = Buffer.from(sigHex, "hex");
  const expectedBuf = Buffer.from(expectedHex, "hex");
  if (actualBuf.length !== expectedBuf.length) return null;
  return timingSafeEqual(actualBuf, expectedBuf) ? sessionId : null;
}

export function resolveGuestSession(request: NextRequest | Request): {
  sessionId: string;
  signedCookieValue: string;
  isNew: boolean;
} {
  let rawCookie: string | undefined;
  if ("cookies" in request && typeof request.cookies?.get === "function") {
    rawCookie = request.cookies.get(COOKIE_NAME)?.value;
  } else {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${COOKIE_NAME}=`));
    if (match) {
      rawCookie = decodeURIComponent(match.slice(COOKIE_NAME.length + 1));
    }
  }

  if (rawCookie) {
    const verified = verifySignedToken(rawCookie);
    if (verified) {
      return {
        sessionId: verified,
        signedCookieValue: rawCookie,
        isNew: false,
      };
    }
  }

  const freshId = randomBytes(16).toString("hex");
  return {
    sessionId: freshId,
    signedCookieValue: signSessionId(freshId),
    isNew: true,
  };
}

export function buildGuestSessionSetCookieHeader(signedValue: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${encodeURIComponent(signedValue)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure}`;
}

export function getClientIpHash(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const realIp = request.headers.get("x-real-ip") || "";
  const ip = forwarded.split(",")[0]?.trim() || realIp.trim() || "unknown";
  return createHash("sha256")
    .update(`${ip}:${getCookieSecret()}`)
    .digest("hex")
    .slice(0, 32);
}

// In-memory safety fallback ONLY when Supabase is unavailable in local dev
const memoryDailyQuota = new Map<string, { date: string; count: number; spendBdt: number }>();

export function getMemoryUsageToday(sessionId: string): { count: number; globalSpendBdt: number } {
  const today = new Date().toISOString().slice(0, 10);
  const entry = memoryDailyQuota.get(sessionId);
  const count = entry && entry.date === today ? entry.count : 0;
  let globalSpendBdt = 0;
  for (const [, val] of memoryDailyQuota.entries()) {
    if (val.date === today) globalSpendBdt += val.spendBdt;
  }
  return { count, globalSpendBdt };
}

export function recordMemoryUsageToday(sessionId: string, costBdt: number): void {
  const today = new Date().toISOString().slice(0, 10);
  const existing = memoryDailyQuota.get(sessionId);
  if (existing && existing.date === today) {
    existing.count += 1;
    existing.spendBdt += costBdt;
  } else {
    memoryDailyQuota.set(sessionId, { date: today, count: 1, spendBdt: costBdt });
  }
}
