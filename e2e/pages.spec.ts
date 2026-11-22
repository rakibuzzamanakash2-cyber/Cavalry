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

test("pages load without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`${page.url()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`${page.url()}: ${e.message}`));
  for (const path of [
    "/",
    "/about",
    "/research",
    "/research/disasters-and-public-spending",
    "/publications",
    "/team",
    "/news",
    "/news/cavalry-research-begins",
    "/contact",
  ]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
  }
  expect(errors).toEqual([]);
});

test("theme script is in the document head exactly once", async ({ request }) => {
  const html = await (await request.get("/about")).text();
  const head = html.slice(0, html.indexOf("</head>"));
  expect(head.match(/id="theme-init"/g)?.length).toBe(1);
});
