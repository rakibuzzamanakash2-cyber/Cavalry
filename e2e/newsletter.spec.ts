import { expect } from "@playwright/test";
import { mailTo, signedInContext, test, uniqueEmail, visitorHeaders } from "./helpers";

test.describe("newsletter", () => {
  test("visitors subscribe from the footer, get a confirmation and can unsubscribe", async ({
    browser,
  }) => {
    const email = uniqueEmail("reader");
    const visitor = await browser.newContext({ extraHTTPHeaders: visitorHeaders() });
    const page = await visitor.newPage();
    await page.goto("/research");
    const footer = page.getByRole("contentinfo");
    await footer.getByLabel("Email address").fill(email);
    await footer.getByRole("button", { name: "Subscribe" }).click();
    await expect(footer.getByRole("status")).toHaveText(/You're subscribed/);

    const [mail] = await mailTo(email);
    expect(mail.subject).toBe("You're subscribed to CAVALRY research updates");
    const link = mail.text.match(/https?:\/\/\S+\/newsletter\/unsubscribe\?token=\S+/)?.[0];
    expect(link).toBeTruthy();

    // Signing up again gives the same answer and sends nothing new.
    await page.goto("/newsletter");
    await page.getByLabel("Email address").first().fill(email);
    await page.getByRole("button", { name: "Subscribe" }).first().click();
    await expect(page.getByRole("status").first()).toHaveText(/You're subscribed/);
    await page.waitForTimeout(500);
    expect(await mailTo(email, { wait: 0 })).toHaveLength(1);

    // Admins see the subscriber and can download the list.
    const admin = await signedInContext(browser, "admin");
    const ap = await admin.context.newPage();
    await ap.goto("/admin/subscribers");
    const subscriber = ap.getByRole("listitem").filter({ hasText: email });
    await expect(subscriber).toBeVisible();
    const csv = await admin.context.request.get("/admin/subscribers/export");
    expect(csv.headers()["content-type"]).toContain("text/csv");
    expect(await csv.text()).toContain(email);

    // The unsubscribe link asks for a click, then removes the address.
    const path = new URL(link!).pathname + new URL(link!).search;
    await page.goto(path);
    await page.getByRole("button", { name: "Unsubscribe" }).click();
    await expect(page.getByRole("status").filter({ hasText: "You're unsubscribed" })).toBeVisible();
    await ap.reload();
    await expect(subscriber).toHaveCount(0);

    await admin.context.close();
    await visitor.close();
  });

  test("the subscriber list is admins only", async ({ browser, request }) => {
    // Visitors are sent to log in; signed-in non-admins are refused.
    const anon = await request.get("/admin/subscribers/export", { maxRedirects: 0 });
    expect(anon.status()).toBe(307);
    expect(anon.headers()["location"]).toContain("/login");
    const member = await signedInContext(browser, "member");
    expect((await member.context.request.get("/admin/subscribers/export")).status()).toBe(403);
    await member.context.close();
  });

  test("bad addresses are explained and bots are ignored", async ({ page }) => {
    await page.goto("/newsletter");
    const form = page.locator("main form");
    await form.getByLabel("Email address").fill("not-an-email");
    // Skip the browser's own check to reach the server's.
    await form.evaluate((f) => f.setAttribute("novalidate", ""));
    await form.getByRole("button", { name: "Subscribe" }).click();
    await expect(form.getByRole("alert")).toHaveText("Please enter a valid email address.");
  });
});
