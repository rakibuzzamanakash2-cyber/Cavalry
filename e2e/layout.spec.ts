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
      fitsOneScreen: el.scrollHeight <= window.innerHeight,
    };
  });
}

const innerPages = [
  "/about",
  "/research",
  "/research/disasters-and-public-spending",
  "/publications",
  "/team",
  "/news",
  "/news/cavalry-research-begins",
  "/contact",
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
  test(`home fits one screen on ${vp.name} ${vp.width}x${vp.height}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: vp });
    const page = await context.newPage();
    await page.goto("/");
    const m = await measure(page);
    expect(m.fitsOneScreen).toBe(true);
    await context.close();
  });
}

test("home shows the research programme", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("img", { name: /CAVALRY research/ }).first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /composition of public spending/i }),
  ).toBeVisible();
  await expect(page.getByText("Research question")).toBeVisible();
});
