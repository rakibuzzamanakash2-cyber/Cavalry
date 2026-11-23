import "server-only";
import { createHash, randomBytes } from "node:crypto";

/** A new unguessable invite token (shown once) and the hash we store. */
export function newInviteToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashInviteToken(token) };
}

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
