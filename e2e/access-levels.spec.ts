import { expect, type Browser, type BrowserContext } from "@playwright/test";
import { fillApplication, signedInContext, test, visitorHeaders } from "./helpers";

// Every access level against the main areas of the site (ADR 0019). The map
// of who can see what is kept here, in the tests, not on the site.

type Level = "visitor" | "user" | "member" | "admin";
const LEVELS: Level[] = ["visitor", "user", "member", "admin"];

/** Where each level ends up when it opens a path ("ok" = the page itself). */
const EXPECTED: Record<string, Record<Level, "ok" | "/login" | "/members-only">> = {
  "/": { visitor: "ok", user: "ok", member: "ok", admin: "ok" },
  "/research": { visitor: "ok", user: "ok", member: "ok", admin: "ok" },
  "/publications": { visitor: "ok", user: "ok", member: "ok", admin: "ok" },
  "/data": { visitor: "ok", user: "ok", member: "ok", admin: "ok" },
  "/team": { visitor: "ok", user: "ok", member: "ok", admin: "ok" },
  "/account": { visitor: "/login", user: "ok", member: "ok", admin: "ok" },
  "/workspace": { visitor: "/login", user: "/members-only", member: "ok", admin: "ok" },
  "/workspace/team": { visitor: "/login", user: "/members-only", member: "ok", admin: "ok" },
  "/workspace/datasets": { visitor: "/login", user: "/members-only", member: "ok", admin: "ok" },
  "/admin/users": {
    visitor: "/login",
    user: "/members-only",
    member: "/members-only",
    admin: "ok",
  },
  "/admin/subscribers": {
    visitor: "/login",
    user: "/members-only",
    member: "/members-only",
    admin: "ok",
  },
};

const LEVEL_NAME: Record<Level, string> = {
  visitor: "Visitor",
  user: "Signed-in user",
  member: "Member",
  admin: "Admin",
};

async function contextFor(browser: Browser, level: Level): Promise<BrowserContext> {
  if (level === "visitor") return browser.newContext({ extraHTTPHeaders: visitorHeaders() });
  return (await signedInContext(browser, level)).context;
}

test.describe("access levels", () => {
  for (const level of LEVELS) {
    test(`${level}: each area opens or is refused as the table says`, async ({ browser }) => {
      const context = await contextFor(browser, level);
      const page = await context.newPage();
      for (const [path, expected] of Object.entries(EXPECTED)) {
        await page.goto(path);
        const want = expected[level] === "ok" ? path : expected[level];
        await expect.poll(() => new URL(page.url()).pathname, { message: path }).toBe(want);
      }

      // Each level is told what it is.
      if (level === "visitor") {
        await page.goto("/members-only");
      } else {
        await page.goto("/account");
      }
      await expect(page.getByTestId("access-level")).toHaveText(LEVEL_NAME[level]);
      // …but not shown the map of the whole site.
      await expect(page.getByRole("table")).toHaveCount(0);
      await context.close();
    });
  }

  test("a member who opens an admin page is told it's for admins, not that they aren't a member", async ({
    browser,
  }) => {
    const { context } = await signedInContext(browser, "member");
    const page = await context.newPage();
    await page.goto("/admin/users");
    await page.waitForURL((u) => u.pathname === "/members-only");
    await expect(
      page.getByRole("heading", { level: 1, name: "This page is for admins" }),
    ).toBeVisible();
    await expect(page.getByText("not a member yet")).toHaveCount(0);
    await context.close();
  });

  test("a signed-in user sees their application status on the account page", async ({
    browser,
  }) => {
    const { context } = await signedInContext(browser, "user");
    const page = await context.newPage();
    await page.goto("/apply");
    await fillApplication(page, "Public finance");
    await page.getByRole("button", { name: "Send application" }).click();
    await expect(page.getByRole("button", { name: "Withdraw application" })).toBeVisible();

    await page.goto("/account");
    await expect(page.getByTestId("application-status")).toContainText("Under review");
    await context.close();
  });

  test("the site doesn't publish a map of who can see what", async ({ page }) => {
    await page.goto("/how-we-work");
    await expect(page.getByRole("heading", { name: "Evidence you can check" })).toBeVisible();
    await expect(page.getByText("Who can see what")).toHaveCount(0);
    await expect(page.getByRole("table")).toHaveCount(0);
  });
});
