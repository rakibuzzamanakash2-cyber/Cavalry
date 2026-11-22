import { expect, test } from "@playwright/test";

const PROGRAMME = "/research/disasters-and-public-spending";

test("research overview lists the flagship programme", async ({ page }) => {
  await page.goto("/research");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "Read the programme" }).click();
  await expect(page).toHaveURL(PROGRAMME);
});

test("programme page shows every section", async ({ page }) => {
  await page.goto(PROGRAMME);
  await expect(
    page.getByRole("heading", { level: 1, name: /composition of public spending/i }),
  ).toBeVisible();
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
  await expect(page.getByText("Current stage")).toBeVisible();
});

test("home card links to the programme", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Read the research programme/ }).click();
  await expect(page).toHaveURL(PROGRAMME);
});

// With Cache Components the shell streams first, so Next.js serves the not-found
// page with a 200 status plus a noindex tag (documented behaviour).
test("unknown programme shows not found and is not indexed", async ({ page }) => {
  await page.goto("/research/does-not-exist");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  expect(await page.locator('meta[name="robots"][content="noindex"]').count()).toBeGreaterThan(0);
});

for (const path of ["/research", PROGRAMME]) {
  for (const width of [320, 390, 820, 1440]) {
    test(`${path} has no sideways scroll at ${width}px`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
      await context.close();
    });
  }
}
