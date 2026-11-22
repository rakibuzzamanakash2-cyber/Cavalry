import { expect, test } from "@playwright/test";

test("every menu link opens a real page", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link")
    .evaluateAll((links) => links.map((a) => a.getAttribute("href")));
  expect(hrefs.length).toBe(6);
  for (const href of hrefs) {
    await page.goto(href!);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Page not found")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: new RegExp(`^${href!.slice(1)}$`, "i") }).first(),
    ).toHaveAttribute("aria-current", "page");
  }
});

test("news post opens from the list", async ({ page }) => {
  await page.goto("/news");
  await page.getByRole("link", { name: /CAVALRY research begins/ }).click();
  await expect(page).toHaveURL(/\/news\/cavalry-research-begins$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("CAVALRY research begins");
});

test("publications shows an honest empty state", async ({ page }) => {
  await page.goto("/publications");
  await expect(page.getByText("Nothing published yet.")).toBeVisible();
  await expect(page.getByText("In preparation").first()).toBeVisible();
});

test("sitemap and robots are served", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  for (const path of [
    "/about",
    "/research/disasters-and-public-spending",
    "/news/cavalry-research-begins",
  ]) {
    expect(xml).toContain(path);
  }
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Sitemap:");
});
