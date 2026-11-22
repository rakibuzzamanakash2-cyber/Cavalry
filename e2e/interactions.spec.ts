import { expect, test } from "@playwright/test";

test.describe("theme", () => {
  test("follows the system setting by default", async ({ browser }) => {
    for (const colorScheme of ["light", "dark"] as const) {
      const context = await browser.newContext({ colorScheme });
      const page = await context.newPage();
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", colorScheme);
      await context.close();
    }
  });

  test("toggle switches theme and remembers it after reload", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "light" });
    const page = await context.newPage();
    await page.goto("/");
    const toggle = page.getByRole("switch", { name: "Dark theme" });
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await context.close();
  });
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens, traps the page behind it, and closes with Escape", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: "Open menu" });
    await button.click();
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();
    await expect(page.locator("#main")).toHaveAttribute("inert", "");
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(page.locator("#main")).not.toHaveAttribute("inert", "");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  });

  test("closes after choosing a page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.locator("#mobile-menu").getByRole("link", { name: "Research" }).click();
    await expect(page).toHaveURL(/\/research$/);
    await expect(page.locator("#mobile-menu")).toBeHidden();
  });

  test("desktop links are hidden on phones", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
  });
});
