/**
 * Only allow redirects to paths on this site ("/workspace"), never to other
 * origins ("https://evil.example", "//evil.example"), to prevent open redirects.
 */
export function safeNext(value: string | string[] | undefined, fallback = "/"): string {
  const next = Array.isArray(value) ? value[0] : value;
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
