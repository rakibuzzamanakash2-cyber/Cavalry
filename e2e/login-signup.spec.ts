import { expect } from "@playwright/test";
import {
  PASSWORD,
  getUid,
  mailTo,
  signedInContext,
  test,
  uniqueEmail,
  uniqueUsername,
  visitorHeaders,
} from "./helpers";

// The login and sign-up pages ported from Ru'sAuth (ADR 0018).

test.describe("sign-up", () => {
  test("creates the account, shows the welcome page and emails a confirmation", async ({
    browser,
  }) => {
    const context = await browser.newContext({ extraHTTPHeaders: visitorHeaders() });
    const page = await context.newPage();
    const email = uniqueEmail("welcome");
    const username = uniqueUsername("welcome");

    await page.goto("/registration");
    await expect(page.getByRole("heading", { level: 1, name: "Sign up" })).toBeVisible();
    await page.getByLabel("Full name").fill("Wren Welcome");
    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Email", { exact: true }).fill(email);
    const password = page.getByLabel("Password", { exact: true });
    await password.fill(PASSWORD);

    // Ru'sAuth's show/hide password button.
    await expect(password).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(password).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Hide password" }).click();

    await page.getByRole("button", { name: "Sign up", exact: true }).click();
    await page.waitForURL((u) => u.pathname === "/welcome");
    await expect(page.getByRole("status").filter({ hasText: "Account created" })).toBeVisible();
    await expect(
      page.getByText("You have successfully created your CAVALRY account"),
    ).toBeVisible();
    const uid = await getUid(email);
    await expect(page.getByTestId("welcome-uid")).toHaveText(uid);
    await expect(page.getByText(`@${username}`)).toBeVisible();

    const [mail] = await mailTo(email);
    expect(mail.subject).toBe("Your CAVALRY account has been created");
    expect(mail.text).toContain("You have successfully created your CAVALRY research account.");
    expect(mail.text).toContain(uid);
    expect(mail.html).toContain(uid);

    // The username chosen at sign-up works for login.
    await context.clearCookies();
    await page.goto("/login?next=/account");
    await page.getByLabel("Email, username or ID").fill(username);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await page.waitForURL((u) => u.pathname === "/account");
    await expect(page.getByTestId("account-uid")).toHaveText(uid);
    await context.close();
  });

  test("a taken or badly formed username is refused", async ({ browser }) => {
    const taken = uniqueUsername("taken");
    const first = await browser.newContext({ extraHTTPHeaders: visitorHeaders() });
    const a = await first.newPage();
    await a.goto("/registration");
    await a.getByLabel("Full name").fill("First Person");
    await a.getByLabel("Username").fill(taken);
    await a.getByLabel("Email", { exact: true }).fill(uniqueEmail("first"));
    await a.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await a.getByRole("button", { name: "Sign up", exact: true }).click();
    await a.waitForURL((u) => u.pathname === "/welcome");
    await first.close();

    const second = await browser.newContext({ extraHTTPHeaders: visitorHeaders() });
    const b = await second.newPage();
    await b.goto("/registration");
    await b.getByLabel("Full name").fill("Second Person");
    await b.getByLabel("Email", { exact: true }).fill(uniqueEmail("second"));
    await b.getByLabel("Password", { exact: true }).fill(PASSWORD);
    for (const [value, message] of [
      [taken, /taken/],
      ["CAV12345", /looks like an account ID/],
    ] as const) {
      await b.getByLabel("Username").fill(value);
      await b.getByRole("button", { name: "Sign up", exact: true }).click();
      await expect(b.getByRole("alert").filter({ hasText: message })).toBeVisible();
    }
    expect(new URL(b.url()).pathname).toBe("/registration");
    await second.close();
  });

  test("the username can't be changed through the auth API", async ({ browser, baseURL }) => {
    const { context, email } = await signedInContext(browser, "user");
    const res = await context.request.post("/api/auth/update-user", {
      data: { username: "sneaky_change", name: "Still Me" },
      headers: { origin: baseURL! },
    });
    expect(res.status()).toBe(400);
    const page = await context.newPage();
    await page.goto("/account");
    await expect(page.getByLabel("Username")).toHaveValue("");
    expect(await getUid(email)).toMatch(/^CAV/);
    await context.close();
  });
});

test.describe("login", () => {
  test("old sign-in and sign-up addresses forward to the new pages", async ({ page }) => {
    await page.goto("/sign-in?next=/workspace");
    await page.waitForURL((u) => u.pathname === "/login");
    expect(new URL(page.url()).searchParams.get("next")).toBe("/workspace");
    await expect(page.getByRole("heading", { level: 1, name: "Login" })).toBeVisible();
    await page.getByRole("link", { name: "Sign up" }).click();
    await page.waitForURL((u) => u.pathname === "/registration");
    expect(new URL(page.url()).searchParams.get("next")).toBe("/workspace");
  });

  test("a Google error sent back to the page is shown", async ({ page }) => {
    await page.goto("/login?error=auth_failed");
    await expect(
      page.getByRole("alert").filter({ hasText: "Could not verify your Google account" }),
    ).toBeVisible();
    await page.waitForURL((u) => !u.search.includes("error"));
  });
});
