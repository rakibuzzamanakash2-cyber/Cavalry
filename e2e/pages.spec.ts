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

test("publications never shows work that is not published", async ({ page }) => {
  // The seeded outputs are in preparation; other tests may publish their own.
  await page.goto("/publications");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("In preparation", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Under review", { exact: true })).toHaveCount(0);
});

test("sitemap and robots are served", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  for (const path of ["/about", "/research", "/publications", "/contact"]) {
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
    "/publications",
    "/team",
    "/news",
    "/contact",
    "/sign-in",
    "/sign-up",
    "/members-only",
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

test("the co-founders are listed with their emails", async ({ page }) => {
  await page.goto("/team");
  for (const [name, email] of [
    ["Md Rakibuzzaman", "rakibuzzaman.akash2@gmail.com"],
    ["Rowshan Rubayet", "rubayet.off@gmail.com"],
  ]) {
    const card = page.getByRole("article").filter({ hasText: name });
    await expect(card.getByRole("link", { name: `Email ${name}` })).toHaveAttribute(
      "href",
      `mailto:${email}`,
    );
  }
  await page.goto("/contact");
  await expect(page.getByRole("link", { name: "rubayet.off@gmail.com" })).toHaveAttribute(
    "href",
    "mailto:rubayet.off@gmail.com",
  );
  await expect(page.getByText("Rowshan Rubayet")).toBeVisible();
});
