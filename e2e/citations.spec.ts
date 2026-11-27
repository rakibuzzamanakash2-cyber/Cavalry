import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";
import { citationKey, formatReference, toBibtex, toRis, type Citable } from "../src/lib/citation";
import { signedInContext, test } from "./helpers";

const box = (page: Page, name: string | RegExp) => page.getByRole("textbox", { name });
const select = (page: Page, name: string) => page.getByRole("combobox", { name });

test.describe("publication pages", () => {
  test("published work gets its own page with links, licence and citations", async ({
    browser,
  }) => {
    const stamp = Date.now();
    const title = `Budgets after cyclones ${stamp}`;
    const admin = await signedInContext(browser, "admin");
    const page = await admin.context.newPage();
    await page.goto("/admin/publications/new");
    await box(page, "Title").fill(title);
    await select(page, "Type").selectOption("working_paper");
    await select(page, "Status").selectOption("published");
    await box(page, "Authors").fill("Md Rakibuzzaman and Rowshan Rubayet");
    await box(page, "Year").fill("2026");
    await box(page, "Abstract").fill("We study how public budgets change after strong cyclones.");
    await box(page, "DOI (optional)").fill(`10.1234/cav.${stamp}`);
    await box(page, "Code link (optional)").fill("https://github.com/example/code");
    await select(page, "Licence (optional)").selectOption("cc-by-4.0");
    await page.getByRole("button", { name: "Save publication" }).click();
    await page.waitForURL((u) => u.pathname === "/admin/publications");
    await admin.context.close();

    const visitor = await browser.newContext();
    const pub = await visitor.newPage();
    await pub.goto("/publications");
    await pub.getByRole("link", { name: title, exact: true }).click();
    await pub.waitForURL(/\/publications\/[a-z0-9-]+$/);
    const slug = new URL(pub.url()).pathname.split("/").pop()!;

    await expect(pub.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(pub.getByRole("heading", { name: "Abstract" })).toBeVisible();
    await expect(pub.getByTestId("licence")).toHaveText(/CC BY 4\.0/);
    await expect(pub.getByRole("link", { name: /^Code/ })).toHaveAttribute(
      "href",
      "https://github.com/example/code",
    );
    await expect(
      pub.locator("main").getByRole("link", { name: "Rowshan Rubayet" }),
    ).toHaveAttribute("href", "/team/rubayet");

    // Google Scholar tags.
    await expect(pub.locator('meta[name="citation_title"]')).toHaveAttribute("content", title);
    await expect(pub.locator('meta[name="citation_author"]')).toHaveCount(2);
    await expect(pub.locator('meta[name="citation_doi"]')).toHaveAttribute(
      "content",
      `10.1234/cav.${stamp}`,
    );

    const cite = pub.getByTestId("citation-text");
    await expect(cite).toContainText("Rakibuzzaman, M., & Rubayet, R. (2026).");
    await pub.getByRole("tab", { name: "BibTeX" }).click();
    await expect(cite).toContainText("@techreport{rakibuzzaman2026budgets");
    await expect(cite).toContainText("author = {Md Rakibuzzaman and Rowshan Rubayet}");
    const download = pub.waitForEvent("download");
    await pub.getByRole("button", { name: "Download .bib" }).click();
    expect((await download).suggestedFilename()).toBe(`${slug}.bib`);
    await pub.getByRole("tab", { name: "RIS" }).click();
    await expect(cite).toContainText("TY  - RPRT");

    // Accessible in both themes, with each citation tab open.
    for (const colorScheme of ["light", "dark"] as const) {
      await pub.emulateMedia({ colorScheme });
      await pub.reload();
      await expect(pub.getByRole("heading", { level: 1, name: title })).toBeVisible();
      const results = await new AxeBuilder({ page: pub })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
        .analyze();
      expect(results.violations.map((v) => v.id)).toEqual([]);
    }

    // The author's profile lists it.
    await pub.goto("/team/rubayet");
    await expect(pub.getByRole("link", { name: title, exact: true })).toBeVisible();
    await visitor.close();
  });

  test("work that is not published has no page", async ({ page }) => {
    // The seeded outputs are all in preparation.
    await page.goto("/publications/disasters-public-spending-working-paper");
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });

  test("citation formats", () => {
    const work: Citable = {
      slug: "x",
      title: "Spending & storms: 100% of the story",
      type: "Journal article",
      authors: "Ada Lovelace, Grace Brewster Hopper & Alan Turing",
      year: 2027,
      venue: "Journal of Things",
      doi: "10.1/abc",
      pageUrl: "https://example.org/publications/x",
      publisher: "CAVALRY research",
    };
    expect(formatReference(work)).toBe(
      "Lovelace, A., Hopper, G. B., & Turing, A. (2027). Spending & storms: 100% of the story. Journal of Things. https://doi.org/10.1/abc",
    );
    expect(citationKey(work)).toBe("lovelace2027spending");
    const bib = toBibtex(work);
    expect(bib).toMatch(/^@article\{lovelace2027spending,/);
    expect(bib).toContain("title = {{Spending \\& storms: 100\\% of the story}}");
    expect(bib).toContain("journal = {Journal of Things}");
    expect(toRis(work)).toContain("JO  - Journal of Things");
    expect(
      formatReference({
        ...work,
        year: undefined,
        doi: undefined,
        authors: "CAVALRY research team",
      }),
    ).toContain("CAVALRY research team (n.d.).");
  });
});
