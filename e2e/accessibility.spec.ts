import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = ["/"];

for (const path of pages) {
  for (const colorScheme of ["light", "dark"] as const) {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      test(`${path} has no accessibility violations (${colorScheme}, ${viewport.width}px)`, async ({
        browser,
      }) => {
        const context = await browser.newContext({ colorScheme, viewport });
        const page = await context.newPage();
        await page.goto(path);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
          .analyze();
        expect(
          results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`),
        ).toEqual([]);
        await context.close();
      });
    }
  }
}
