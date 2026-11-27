import { expect, test } from "@playwright/test";
import { researchAreas } from "../src/content/research";
import { isAuthor, splitAuthors } from "../src/lib/authors";

test.describe("research area pages", () => {
  test("each area has its own page, reachable from the research page", async ({ page }) => {
    await page.goto("/research");
    for (const area of researchAreas) {
      await page.goto("/research");
      await page.getByRole("link", { name: area.title, exact: true }).first().click();
      await page.waitForURL(`**/research/areas/${area.slug}`);
      await expect(page.getByRole("heading", { level: 1, name: area.title })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Questions we ask" })).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Published work in this area" }),
      ).toBeVisible();
      // Links to the three other areas.
      const others = page.locator("#other-areas").locator("xpath=..").getByRole("link");
      await expect(others).toHaveCount(researchAreas.length - 1);
    }
  });

  test("an unknown area is a 404 and the bare list redirects to the research page", async ({
    page,
  }) => {
    await page.goto("/research/areas/astrology");
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await page.goto("/research/areas");
    await page.waitForURL((u) => u.pathname === "/research");
  });
});

test.describe("how we work", () => {
  test("is in the main navigation and lists the stages with their gates", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page
      .getByRole("navigation", { name: /main/i })
      .getByRole("link", { name: "How we work" })
      .click();
    await page.waitForURL("**/how-we-work");
    await expect(
      page.getByRole("heading", { level: 1, name: "Evidence you can check" }),
    ).toBeVisible();
    for (const stage of ["Protocol", "Data audit", "Dataset", "Analysis", "Publication"]) {
      await expect(page.getByRole("heading", { level: 3, name: stage, exact: true })).toBeVisible();
    }
    await expect(page.getByText("Gate:")).toHaveCount(5);
  });
});

test.describe("profiles", () => {
  test("team cards link to each person's profile", async ({ page }) => {
    await page.goto("/team");
    await page.getByRole("link", { name: "Rowshan Rubayet", exact: true }).click();
    await page.waitForURL("**/team/rubayet");
    await expect(page.getByRole("heading", { level: 1, name: "Rowshan Rubayet" })).toBeVisible();
    await expect(page.getByText("Co-founder", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Publications" })).toBeVisible();
    await page.goto("/team/nobody-here");
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });

  test("author names that match a profile become links", () => {
    const people = [
      { name: "Md Rakibuzzaman", slug: "rakib" },
      { name: "Rowshan Rubayet", slug: "rubayet" },
    ];
    const parts = splitAuthors("md rakibuzzaman, A. Visitor and Rowshan  Rubayet", people);
    expect(parts.map((p) => p.text).join("")).toBe(
      "md rakibuzzaman, A. Visitor and Rowshan  Rubayet",
    );
    expect(parts.filter((p) => p.slug).map((p) => p.slug)).toEqual(["rakib", "rubayet"]);
    expect(isAuthor("A, B & Rowshan Rubayet", "Rowshan Rubayet")).toBe(true);
    expect(isAuthor("Rowshan Rubayetson", "Rowshan Rubayet")).toBe(false);
  });
});
