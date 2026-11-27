import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { getDb } from "./db";

// Simple fixed-window limit for public forms (newsletter), kept in the same
// rate_limit table Better Auth uses so it holds across serverless instances.
// Keys hold a hash of the visitor's IP, never the IP itself.

async function visitorKey(scope: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const hash = createHash("sha256").update(`${scope}:${ip}`).digest("hex").slice(0, 32);
  return `form:${scope}:${hash}`;
}

/** True when the visitor may go ahead; false once they pass `max` within `windowSeconds`. */
export async function allowFormSubmission(scope: string, max: number, windowSeconds: number) {
  const key = await visitorKey(scope);
  const now = BigInt(Date.now());
  const windowMs = BigInt(windowSeconds * 1000);
  const db = getDb();
  const row = await db.rateLimit.findUnique({ where: { key } });
  if (!row || now - row.lastRequest > windowMs) {
    await db.rateLimit.upsert({
      where: { key },
      create: { id: randomUUID(), key, count: 1, lastRequest: now },
      update: { count: 1, lastRequest: now },
    });
    return true;
  }
  if (row.count >= max) return false;
  await db.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return true;
}
