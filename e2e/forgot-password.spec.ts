import { expect, type Page } from "@playwright/test";
import { PASSWORD, mailTo, signedInContext, test, uniqueEmail, visitorHeaders } from "./helpers";

// Forgot password, ported from Ru'sAuth: email → 6-digit code → new password.

const NEW_PASSWORD = "a-brand-new-password-42";

function codeFrom(text: string) {
  return text.match(/\b(\d{6})\b/)?.[1] ?? "";
}

async function login(page: Page, identifier: string, password: string) {
  await page.goto("/login?next=/account");
  await page.getByLabel("Email, username or ID").fill(identifier);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
}

test.describe("forgot password", () => {
  test("resets the password with an emailed code and signs out every device", async ({
    browser,
  }) => {
    // Signed in on one device…
    const { context: device, email } = await signedInContext(browser, "user");
    const devicePage = await device.newPage();
    await devicePage.goto("/account");
    await expect(devicePage.getByTestId("account-uid")).toBeVisible();

    // …and resetting on another.
    const other = await browser.newContext({ extraHTTPHeaders: visitorHeaders() });
    const page = await other.newPage();
    await page.goto("/login");
    await page.getByRole("link", { name: "Forgot password?" }).click();
    await page.waitForURL((u) => u.pathname === "/forgot-password");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByRole("button", { name: "Send code" }).click();
    await page.waitForURL((u) => u.pathname === "/otp-verification");
    await expect(page.getByText(email)).toBeVisible();

    let mail: { subject: string; text: string } | undefined;
    await expect
      .poll(async () => {
        mail = (await mailTo(email, { wait: 0 })).find(
          (m) => m.subject === "Your CAVALRY password reset code",
        );
        return Boolean(mail);
      })
      .toBe(true);
    const code = codeFrom(mail!.text);
    expect(code).toMatch(/^\d{6}$/);

    // A wrong code is refused.
    const wrong = code === "000000" ? "111111" : "000000";
    await page.getByLabel("Reset code").fill(wrong);
    await page.getByRole("button", { name: "Verify code" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "isn't right" })).toBeVisible();

    await page.getByLabel("Reset code").fill(code);
    await page.getByRole("button", { name: "Verify code" }).click();
    await page.waitForURL((u) => u.pathname === "/new-password");

    // The two passwords must match.
    await page.getByLabel("New password", { exact: true }).fill(NEW_PASSWORD);
    await page.getByLabel("Confirm new password", { exact: true }).fill("something-else-123");
    await page.getByRole("button", { name: "Change password" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "do not match" })).toBeVisible();

    await page.getByLabel("Confirm new password", { exact: true }).fill(NEW_PASSWORD);
    await page.getByRole("button", { name: "Change password" }).click();
    await page.waitForURL((u) => u.pathname === "/login");
    await expect(page.getByRole("status").filter({ hasText: "Password changed" })).toBeVisible();

    // A notice is emailed, and the other device was signed out.
    await expect
      .poll(async () => (await mailTo(email, { wait: 0 })).map((m) => m.subject))
      .toContain("Your CAVALRY password was changed");
    await devicePage.goto("/account");
    await devicePage.waitForURL((u) => u.pathname === "/login");

    // The old password no longer works; the new one does.
    await login(page, email, PASSWORD);
    await expect(
      page.getByRole("alert").filter({ hasText: /don't match an account/ }),
    ).toBeVisible();
    await login(page, email, NEW_PASSWORD);
    await page.waitForURL((u) => u.pathname === "/account");

    // The code can't be used twice.
    const reuse = await other.request.post("/api/auth/email-otp/reset-password", {
      data: { email, otp: code, password: "yet-another-password-9" },
      headers: { origin: new URL(page.url()).origin },
    });
    expect(reuse.status()).toBe(400);

    await device.close();
    await other.close();
  });

  test("an unknown email gets the same reply and no email", async ({ browser }) => {
    const email = uniqueEmail("nobody");
    const context = await browser.newContext({ extraHTTPHeaders: visitorHeaders() });
    const page = await context.newPage();
    await page.goto("/forgot-password");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByRole("button", { name: "Send code" }).click();
    await page.waitForURL((u) => u.pathname === "/otp-verification");
    await expect(
      page.getByRole("status").filter({ hasText: "If that email has an account" }),
    ).toBeVisible();
    await page.waitForTimeout(1000);
    expect(await mailTo(email, { wait: 0 })).toHaveLength(0);
    await context.close();
  });

  test("the later steps ask to start again without the earlier ones", async ({ page }) => {
    for (const path of ["/otp-verification", "/new-password"]) {
      await page.goto(path);
      await expect(page.getByRole("link", { name: "Start again" })).toHaveAttribute(
        "href",
        "/forgot-password",
      );
    }
  });

  test("signing in by emailed code is switched off", async ({ request, baseURL }) => {
    for (const path of [
      "/api/auth/sign-in/email-otp",
      "/api/auth/email-otp/send-verification-otp",
    ]) {
      const res = await request.post(path, {
        data: { email: uniqueEmail("x"), otp: "123456", type: "sign-in" },
        headers: { origin: baseURL! },
      });
      expect(res.status(), path).toBe(404);
    }
  });
});
