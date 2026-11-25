import { expect } from "@playwright/test";
import { test, uniqueEmail, visitorHeaders } from "./helpers";

test("pages are served with security headers", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["permissions-policy"]).toContain("camera=()");
  expect(h["x-powered-by"]).toBeUndefined();
});

test("repeated sign-in attempts from one address are slowed down", async ({
  playwright,
  baseURL,
}) => {
  // One address, many tries: the limit is kept in the database, so it holds
  // across server instances on Vercel.
  const api = await playwright.request.newContext({ baseURL, extraHTTPHeaders: visitorHeaders() });
  const statuses: number[] = [];
  for (let i = 0; i < 6; i++) {
    const res = await api.post("/api/auth/sign-in/email", {
      data: { email: uniqueEmail("nobody"), password: "wrong-password-123" },
      headers: { origin: baseURL! },
    });
    statuses.push(res.status());
  }
  expect(statuses).toContain(429);
  await api.dispose();
});
