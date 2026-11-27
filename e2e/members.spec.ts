import { expect } from "@playwright/test";
import { PASSWORD, getUid, openProject, signedInContext, test, visitorHeaders } from "./helpers";

test.describe("account IDs and usernames", () => {
  test("anyone can sign in with their ID, a username or their email", async ({ browser }) => {
    const { context, email } = await signedInContext(browser, "user");
    const page = await context.newPage();
    const uid = await getUid(email);
    expect(uid).toMatch(/^CAV\d{5,}$/);

    await page.goto("/account");
    await expect(page.getByTestId("account-uid")).toHaveText(uid);

    const username = `tester_${Date.now().toString(36)}`;
    await page.getByLabel("Username").fill(username.toUpperCase());
    await page.getByRole("button", { name: "Save username" }).click();
    await expect(page.getByRole("status")).toContainText(`sign in as ${username}`);

    for (const identifier of [uid.toLowerCase(), `@${username}`, email]) {
      await context.clearCookies();
      await page.goto("/login?next=/account");
      await page.getByLabel("Email, username or ID").fill(identifier);
      await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
      await page.getByRole("button", { name: "Login", exact: true }).click();
      await page.waitForURL((u) => u.pathname === "/account");
      await expect(page.getByTestId("account-uid")).toHaveText(uid);
    }
    await context.close();
  });

  test("an unknown username fails the same way as a wrong password", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email, username or ID").fill("nobody_by_this_name");
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: /don.t match an account/ }),
    ).toBeVisible();
  });

  test("usernames are checked and must be unique", async ({ browser }) => {
    const first = await signedInContext(browser, "user");
    const second = await signedInContext(browser, "user");
    const taken = `taken_${Date.now().toString(36)}`;

    const a = await first.context.newPage();
    await a.goto("/account");
    await a.getByLabel("Username").fill(taken);
    await a.getByRole("button", { name: "Save username" }).click();
    await expect(a.getByRole("status")).toBeVisible();

    const b = await second.context.newPage();
    await b.goto("/account");
    for (const [value, message] of [
      [taken, /taken/],
      ["CAV12345", /looks like an account ID/],
      ["a!", /3 to 30|lowercase letters/],
    ] as const) {
      await b.getByLabel("Username").fill(value);
      await b.getByRole("button", { name: "Save username" }).click();
      await expect(b.getByRole("alert").filter({ hasText: message })).toBeVisible();
    }
    await first.context.close();
    await second.context.close();
  });
});

test.describe("joining", () => {
  test("visitors and non-members are invited to apply; members are not", async ({ browser }) => {
    const visitor = await browser.newContext({ extraHTTPHeaders: visitorHeaders() });
    const vp = await visitor.newPage();
    await vp.goto("/");
    await expect(vp.getByRole("link", { name: "Work with us" }).first()).toHaveAttribute(
      "href",
      "/apply",
    );
    await expect(vp.getByRole("heading", { name: "Work with us" })).toBeVisible();
    await visitor.close();

    const { context, name } = await signedInContext(browser, "member", {}, "Mina Member");
    const page = await context.newPage();
    for (const path of ["/", "/team"]) {
      await page.goto(path);
      await expect(page.getByRole("contentinfo")).toBeVisible();
      await expect(page.locator('a[href="/apply"]')).toHaveCount(0);
    }
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: `Welcome back, ${name.split(" ")[0]}` }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Open the workspace" }).first()).toBeVisible();
    await page.getByRole("button", { name: /Account menu/ }).click();
    await expect(page.getByRole("menuitem", { name: "Apply to join" })).toHaveCount(0);
    await expect(page.getByRole("menuitem", { name: "Your account" })).toBeVisible();
    await context.close();
  });
});

test.describe("people lists", () => {
  test("admins see everyone grouped admin, leader, member, user and can search", async ({
    browser,
  }) => {
    const tag = `Zq${Date.now().toString(36)}`;
    const admin = await signedInContext(browser, "admin", {}, `${tag} Ada`);
    const leader = await signedInContext(browser, "member", {}, `${tag} Lee`);
    const member = await signedInContext(browser, "member", {}, `${tag} Max`);
    const user = await signedInContext(browser, "user", {}, `${tag} Uma`);

    const lp = await leader.context.newPage();
    await openProject(lp, `${tag} flood study`);

    const page = await admin.context.newPage();
    await page.goto(`/admin/users?q=${tag}`);
    const rows = page.getByTestId("user-list").locator("li");
    await expect(rows).toHaveCount(4);
    await expect(rows.nth(0)).toContainText(`${tag} Ada`);
    await expect(rows.nth(0)).toContainText("Admin");
    await expect(rows.nth(1)).toContainText(`${tag} Lee`);
    await expect(rows.nth(1)).toContainText("Leader");
    await expect(rows.nth(2)).toContainText(`${tag} Max`);
    await expect(rows.nth(3)).toContainText(`${tag} Uma`);

    await page.getByRole("link", { name: /^Members/ }).click();
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(`${tag} Max`);

    const uid = await getUid(user.email);
    await page.goto(`/admin/users?q=${uid}`);
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(uid);

    // The members' directory groups the same way and leaves out non-members.
    const mp = await member.context.newPage();
    await mp.goto(`/workspace/team?q=${tag}`);
    const people = mp
      .locator("#people")
      .locator("xpath=ancestor::section[1]")
      .locator("ul")
      .first();
    await expect(people.locator(":scope > li")).toHaveCount(3);
    await expect(people.locator(":scope > li").nth(0)).toContainText(`${tag} Ada`);
    await expect(people.locator(":scope > li").nth(1)).toContainText(`${tag} Lee`);
    await expect(mp.getByText(`${tag} Uma`)).toHaveCount(0);

    for (const c of [admin, leader, member, user]) await c.context.close();
  });
});
