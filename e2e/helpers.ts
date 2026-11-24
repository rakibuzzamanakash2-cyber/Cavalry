import { test as base, type Browser, type BrowserContext, type Page } from "@playwright/test";
import pg from "pg";

// Shared test helpers. Tests run against a real database (DATABASE_URL), the
// same one the app under test uses.

export const PROGRAMME_SLUG = "disasters-and-public-spending";
export const PUBLIC_PAGES = [
  "/",
  "/about",
  "/research",
  "/publications",
  "/team",
  "/news",
  "/contact",
];
export const AUTH_PAGES = ["/sign-in", "/sign-up", "/members-only", "/apply"];

/** Text that must never appear on a public page while the flagship is in progress. */
export const CONFIDENTIAL =
  /composition of public spending|Local projections|IBTrACS|Sub-questions/i;

/**
 * Each test context acts as a separate visitor with its own IP address.
 * Better Auth rate-limits sign-in and sign-up per IP (3 per 10 s), using the
 * x-forwarded-for header that the hosting platform sets; the limit stays on.
 */
export function visitorHeaders() {
  const n = () => Math.floor(Math.random() * 250) + 1;
  return { "x-forwarded-for": `10.${n()}.${n()}.${n()}` };
}

/** Use this `test` in specs that sign in, so the default page gets its own IP too. */
export const test = base.extend({
  context: async ({ browser, contextOptions }, provide) => {
    const context = await browser.newContext({
      ...contextOptions,
      extraHTTPHeaders: { ...contextOptions.extraHTTPHeaders, ...visitorHeaders() },
    });
    await provide(context);
    await context.close();
  },
});

let pool: pg.Pool | undefined;
function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be set for e2e tests.");
  pool ??= new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  return pool;
}

export async function setRole(email: string, role: "user" | "member" | "admin") {
  await db().query(`UPDATE "user" SET role = $1 WHERE email = $2`, [role, email]);
}

let counter = 0;
export function uniqueEmail(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 7)}@example.com`;
}

export const PASSWORD = "correct-horse-42";

/**
 * A signed-in browser context with the given role. Signs up through the real
 * Better Auth endpoint, then sets the role directly in the database.
 */
export async function signedInContext(
  browser: Browser,
  role: "user" | "member" | "admin",
  options: Parameters<Browser["newContext"]>[0] = {},
  displayName?: string,
): Promise<{ context: BrowserContext; email: string; name: string }> {
  const context = await browser.newContext({
    ...options,
    extraHTTPHeaders: { ...options.extraHTTPHeaders, ...visitorHeaders() },
  });
  const email = uniqueEmail(role);
  const name = displayName ?? `Test ${role[0].toUpperCase()}${role.slice(1)}`;
  const res = await context.request.post("/api/auth/sign-up/email", {
    data: { name, email, password: PASSWORD },
    headers: { origin: process.env.BETTER_AUTH_URL ?? "http://localhost:3100" },
  });
  if (!res.ok()) throw new Error(`Sign-up failed: ${res.status()} ${await res.text()}`);
  if (role !== "user") await setRole(email, role);
  return { context, email, name };
}

/** Open a new project as the signed-in member; returns its path. */
export async function openProject(page: Page, title: string) {
  await page.goto("/workspace/projects/new");
  await page.getByLabel("Project title").fill(title);
  await page
    .getByLabel("Short summary")
    .fill("A test project about how cities fund flood defences.");
  await page.getByLabel("Research question").fill(`Secret question for ${title}: does it work?`);
  await page.getByRole("button", { name: "Open project" }).click();
  await page.waitForURL(
    (u) => /^\/workspace\/projects\/[a-z0-9-]+$/.test(u.pathname) && !u.pathname.endsWith("/new"),
  );
  return new URL(page.url()).pathname;
}

/** As the leader, add an existing member to the project at `path` with a role. */
export async function addToProject(
  page: Page,
  path: string,
  person: { name: string; email: string },
  role: string,
) {
  await page.goto(`${path}/team`);
  await page.getByLabel("Member", { exact: true }).selectOption({
    label: `${person.name} (${person.email})`,
  });
  await page.getByLabel("Role on this project").fill(role);
  await page.getByRole("button", { name: "Add member" }).click();
  await page.getByRole("status").filter({ hasText: "Member added." }).waitFor();
}
