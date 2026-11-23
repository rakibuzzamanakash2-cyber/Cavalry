import { expect } from "@playwright/test";
import {
  AUTH_PAGES,
  CONFIDENTIAL,
  PASSWORD,
  PROGRAMME_SLUG,
  PUBLIC_PAGES,
  signedInContext,
  test,
  uniqueEmail,
} from "./helpers";

test.describe("public visitors", () => {
  test("public pages contain no confidential research", async ({ request }) => {
    for (const path of [...PUBLIC_PAGES, ...AUTH_PAGES, "/sitemap.xml"]) {
      const html = await (await request.get(path)).text();
      expect(html, `${path} leaks confidential text`).not.toMatch(CONFIDENTIAL);
    }
  });

  test("in-progress programme is not visible publicly", async ({ page }) => {
    await page.goto(`/research/${PROGRAMME_SLUG}`);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    expect(await page.content()).not.toMatch(CONFIDENTIAL);
  });

  test("workspace and admin redirect to sign-in", async ({ request }) => {
    for (const path of [
      "/workspace",
      `/workspace/projects/${PROGRAMME_SLUG}`,
      "/admin/users",
      "/invite/some-token",
    ]) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), path).toBe(307);
      expect(res.headers()["location"]).toContain(`/sign-in?next=${encodeURIComponent(path)}`);
    }
  });
});

test.describe("signing up and in", () => {
  test("a new account is a signed-in user without workspace access", async ({ page }) => {
    await page.goto("/sign-up?next=/workspace");
    await page.getByLabel("Full name").fill("New Person");
    await page.getByLabel("Email").fill(uniqueEmail("signup"));
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL((u) => u.pathname === "/members-only");
    await expect(page.getByText("Signed in as New Person")).toBeVisible();
    await expect(page.getByRole("button", { name: /Account menu for New Person/ })).toBeVisible();
  });

  test("sign-in never redirects to another site", async ({ browser }) => {
    const { context, email } = await signedInContext(browser, "user");
    await context.clearCookies();
    const page = await context.newPage();
    await page.goto("/sign-in?next=https://evil.example/");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL((u) => u.pathname === "/");
    expect(new URL(page.url()).hostname).toBe("localhost");
    await context.close();
  });

  test("wrong password shows an error", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(uniqueEmail("nobody"));
    await page.getByLabel("Password").fill("not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert")).toBeVisible();
  });
});

test.describe("members", () => {
  test("see that projects exist, but not the details of other teams' work", async ({ browser }) => {
    const { context } = await signedInContext(browser, "member");
    const page = await context.newPage();
    await page.goto("/workspace");
    await expect(
      page.getByRole("heading", { name: /composition of public spending/i }),
    ).toBeVisible();
    await expect(page.getByText(/Team only\./).first()).toBeVisible();

    await page.goto(`/workspace/projects/${PROGRAMME_SLUG}`);
    await expect(page.getByText(/visible only to its team/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Research question" })).toHaveCount(0);
    expect(await page.content()).not.toMatch(/Local projections|IBTrACS|Sub-questions/i);
    await context.close();
  });

  test("admins can read every project in full", async ({ browser }) => {
    const { context } = await signedInContext(browser, "admin");
    const page = await context.newPage();
    await page.goto("/workspace");
    await page
      .getByRole("link", { name: /Open project .*composition of public spending/i })
      .click();
    await expect(page).toHaveURL(new RegExp(`/workspace/projects/${PROGRAMME_SLUG}$`));
    for (const name of [
      "Research question",
      "Sub-questions & hypotheses",
      "Proposed design",
      "Candidate data",
      "Proposed approach",
      "Scope & fallbacks",
      "Roadmap",
      "Outputs & integrity",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
    }
    await context.close();
  });

  test("cannot open the admin area", async ({ browser }) => {
    const { context } = await signedInContext(browser, "member");
    const page = await context.newPage();
    await page.goto("/admin/users");
    await page.waitForURL((u) => u.pathname === "/members-only");
    await context.close();
  });

  test("signed-in users who are not members are kept out", async ({ browser }) => {
    const { context } = await signedInContext(browser, "user");
    const page = await context.newPage();
    await page.goto(`/workspace/projects/${PROGRAMME_SLUG}`);
    await page.waitForURL((u) => u.pathname === "/members-only");
    expect(await page.content()).not.toMatch(CONFIDENTIAL);
    await context.close();
  });
});

test.describe("admins", () => {
  test("change a role, and the change applies immediately", async ({ browser }) => {
    const member = await signedInContext(browser, "member");
    const admin = await signedInContext(browser, "admin");

    const adminPage = await admin.context.newPage();
    await adminPage.goto("/admin/users");
    const row = adminPage.getByRole("listitem").filter({ hasText: member.email });
    await row.getByLabel(`Role for ${member.name}`).selectOption("user");
    await row.getByRole("button", { name: "Save" }).click();
    await expect(row.getByRole("status")).toHaveText("Role updated.");

    // The member's sessions were revoked, so they are sent to sign in again.
    const memberPage = await member.context.newPage();
    await memberPage.goto("/workspace");
    await memberPage.waitForURL((u) => u.pathname === "/sign-in");

    await member.context.close();
    await admin.context.close();
  });

  test("cannot change their own role", async ({ browser }) => {
    const admin = await signedInContext(browser, "admin");
    const page = await admin.context.newPage();
    await page.goto("/admin/users");
    const row = page.getByRole("listitem").filter({ hasText: admin.email });
    await expect(row.getByText("Admin (you)")).toBeVisible();
    await expect(row.getByRole("combobox")).toHaveCount(0);
    await admin.context.close();
  });
});
