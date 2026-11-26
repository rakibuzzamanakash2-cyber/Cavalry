import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { name: "small phone", width: 320, height: 640 },
  { name: "phone", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "laptop", width: 1280, height: 720 },
  { name: "desktop", width: 1440, height: 900 },
];

async function measure(page: Page) {
  return page.evaluate(() => {
    const el = document.documentElement;
    return {
      horizontalOverflow: el.scrollWidth > el.clientWidth,
    };
  });
}

const innerPages = [
  "/about",
  "/research",
  "/publications",
  "/team",
  "/news",
  "/contact",
  "/sign-in",
  "/sign-up",
  "/members-only",
];

for (const vp of viewports) {
  for (const path of innerPages) {
    test(`${path} header and page fit ${vp.name} width`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: vp });
      const page = await context.newPage();
      await page.goto(path);
      expect((await measure(page)).horizontalOverflow).toBe(false);
      await context.close();
    });
  }
  for (const colorScheme of ["light", "dark"] as const) {
    test(`home has no sideways scroll on ${vp.name} (${colorScheme})`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: vp, colorScheme });
      const page = await context.newPage();
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", colorScheme);
      const m = await measure(page);
      expect(m.horizontalOverflow).toBe(false);
      await context.close();
    });
  }
}

for (const vp of viewports.filter((v) => v.width >= 1280)) {
  test(`home's first section fits one screen on ${vp.name} ${vp.width}x${vp.height}`, async ({
    browser,
  }) => {
    // The homepage scrolls (ADR 0014), but who we are and the main actions
    // must be visible without scrolling on a laptop.
    const context = await browser.newContext({ viewport: vp });
    const page = await context.newPage();
    await page.goto("/");
    const bottom = await page
      .locator("section[aria-labelledby='hero-title']")
      .evaluate((el) => el.getBoundingClientRect().bottom);
    expect(bottom).toBeLessThanOrEqual(vp.height);
    await expect(page.getByRole("link", { name: "Explore our research" })).toBeInViewport();
    await context.close();
  });
}

test("home shows who we are, our research areas and how we work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("img", { name: /CAVALRY research/ }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "What we work on" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Evidence you can check" })).toBeVisible();
});
