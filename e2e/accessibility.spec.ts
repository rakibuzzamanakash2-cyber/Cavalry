import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";
import { PROGRAMME_SLUG, signedInContext, test } from "./helpers";

const pages = [
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
  "/apply",
];

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

// Private pages, audited as the people who can see them.
const privatePages = [
  { path: "/workspace", role: "member" as const },
  { path: `/workspace/projects/${PROGRAMME_SLUG}`, role: "admin" as const },
  { path: `/workspace/projects/${PROGRAMME_SLUG}/team`, role: "admin" as const },
  { path: `/workspace/projects/${PROGRAMME_SLUG}`, role: "member" as const },
  { path: "/workspace/projects/new", role: "member" as const },
  { path: "/workspace/team", role: "admin" as const },
  { path: "/workspace/datasets", role: "member" as const },
  { path: "/workspace/datasets/new", role: "member" as const },
  { path: `/workspace/projects/${PROGRAMME_SLUG}/edit`, role: "admin" as const },
  { path: "/admin/news", role: "admin" as const },
  { path: "/admin/news/new", role: "admin" as const },
  { path: "/admin/publications", role: "admin" as const },
  { path: "/admin/publications/new", role: "admin" as const },
  { path: "/admin/team", role: "admin" as const },
  { path: "/admin/team/people/new", role: "admin" as const },
  { path: "/admin/users", role: "admin" as const },
  { path: "/admin/applications", role: "admin" as const },
  { path: "/apply", role: "user" as const },
];

for (const { path, role } of privatePages) {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`${path} has no accessibility violations (${colorScheme}, ${role})`, async ({
      browser,
    }) => {
      const { context } = await signedInContext(browser, role, { colorScheme });
      const page = await context.newPage();
      await page.goto(path);
      await page.waitForLoadState("networkidle");
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
