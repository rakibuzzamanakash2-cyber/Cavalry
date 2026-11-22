import { expect, test } from "@playwright/test";

test("public research page shows completed work only", async ({ page }) => {
  await page.goto("/research");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("No completed programmes yet.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Research areas" })).toBeVisible();
});

// With Cache Components the shell streams first, so Next.js serves the not-found
// page with a 200 status plus a noindex tag (documented behaviour).
test("unknown programme shows not found and is not indexed", async ({ page }) => {
  await page.goto("/research/does-not-exist");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  expect(await page.locator('meta[name="robots"][content="noindex"]').count()).toBeGreaterThan(0);
});

for (const width of [320, 390, 820, 1440]) {
  test(`/research has no sideways scroll at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.goto("/research");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
    await context.close();
  });
}
