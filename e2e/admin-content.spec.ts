import { expect, type Page } from "@playwright/test";
import { openProject, signedInContext, test } from "./helpers";

const box = (page: Page, name: string | RegExp) => page.getByRole("textbox", { name });
const select = (page: Page, name: string) => page.getByRole("combobox", { name });

async function writePost(
  page: Page,
  p: { title: string; visibility: "public" | "members"; publish: "draft" | "published" },
) {
  await page.goto("/admin/news/new");
  await box(page, "Title").fill(p.title);
  await box(page, "Summary").fill("A short update on what the team did this month.");
  await box(page, "Text").fill(
    "First paragraph of the update.\n\nSecond paragraph with more detail.",
  );
  await box(page, /^Tags/).fill("Update, Data");
  await select(page, "Who can read it").selectOption(p.visibility);
  await select(page, "State").selectOption(p.publish);
  await page.getByRole("button", { name: "Save post" }).click();
  await page.waitForURL((u) => u.pathname === "/admin/news");
}

test.describe("admin content", () => {
  test("an admin publishes a public news post, then makes it members-only", async ({ browser }) => {
    const title = `Field notes ${Date.now()}`;
    const admin = await signedInContext(browser, "admin");
    const page = await admin.context.newPage();
    await writePost(page, { title, visibility: "public", publish: "published" });

    const visitor = await browser.newContext();
    const pub = await visitor.newPage();
    await pub.goto("/news");
    await pub
      .getByRole("link", { name: new RegExp(title) })
      .first()
      .click();
    await expect(pub.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(pub.getByText("Second paragraph with more detail.")).toBeVisible();

    await page.getByRole("link", { name: `Edit ${title}` }).click();
    await select(page, "Who can read it").selectOption("members");
    await page.getByRole("button", { name: "Save changes" }).click();
    await page.waitForURL((u) => u.pathname === "/admin/news");

    await pub.goto("/news");
    await expect(pub.getByText(title)).toHaveCount(0);
    await page.goto("/workspace");
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    await page.goto("/admin/news");
    await page.getByRole("link", { name: `Edit ${title}` }).click();
    await page.getByRole("button", { name: "Delete post" }).click();
    await page.waitForURL((u) => u.pathname === "/admin/news");
    await expect(page.getByRole("heading", { name: title })).toHaveCount(0);
    await visitor.close();
    await admin.context.close();
  });

  test("drafts are not shown anywhere", async ({ browser }) => {
    const title = `Draft notes ${Date.now()}`;
    const admin = await signedInContext(browser, "admin");
    const page = await admin.context.newPage();
    await writePost(page, { title, visibility: "public", publish: "draft" });
    await expect(
      page.getByRole("listitem").filter({ hasText: title }).getByText("Draft", { exact: true }),
    ).toBeVisible();
    await page.goto("/news");
    await expect(page.getByText(title)).toHaveCount(0);
    await page.goto("/workspace");
    await expect(page.getByText(title)).toHaveCount(0);
    await admin.context.close();
  });

  test("publications appear publicly only once published", async ({ browser }) => {
    const stamp = Date.now();
    const title = `Sector shares after storms ${stamp}`;
    const admin = await signedInContext(browser, "admin");
    const page = await admin.context.newPage();
    await page.goto("/admin/publications/new");
    await box(page, "Title").fill(title);
    await select(page, "Type").selectOption("working_paper");
    await select(page, "Status").selectOption("in_preparation");
    await box(page, "Authors").fill("Rakibuzzaman, M. and Rubayet");
    await box(page, "Year").fill("2026");
    await box(page, "Abstract").fill("We study how sector shares of spending move after storms.");
    await box(page, "DOI (optional)").fill(`https://doi.org/10.1234/cavalry.${stamp}`);
    await page.getByRole("button", { name: "Save publication" }).click();
    await page.waitForURL((u) => u.pathname === "/admin/publications");

    const visitor = await browser.newContext();
    const pub = await visitor.newPage();
    await pub.goto("/publications");
    await expect(pub.getByText(title)).toHaveCount(0);

    await page.getByRole("link", { name: `Edit ${title}` }).click();
    await expect(box(page, "DOI (optional)")).toHaveValue(`10.1234/cavalry.${stamp}`);
    await select(page, "Status").selectOption("published");
    await page.getByRole("button", { name: "Save changes" }).click();
    await page.waitForURL((u) => u.pathname === "/admin/publications");

    await pub.goto("/publications");
    await expect(pub.getByRole("heading", { name: title })).toBeVisible();
    await expect(pub.locator(`a[href="https://doi.org/10.1234/cavalry.${stamp}"]`)).toBeVisible();
    await visitor.close();
    await admin.context.close();
  });

  test("a public output never links to a programme that is not public", async ({ browser }) => {
    const stamp = Date.now();
    const member = await signedInContext(browser, "member");
    const mpage = await member.context.newPage();
    const projectTitle = `Hidden programme ${stamp}`;
    const path = await openProject(mpage, projectTitle);
    const slug = path.split("/").pop();

    const admin = await signedInContext(browser, "admin");
    const page = await admin.context.newPage();
    const title = `Brief on hidden work ${stamp}`;
    await page.goto("/admin/publications/new");
    await box(page, "Title").fill(title);
    await select(page, "Status").selectOption("published");
    await box(page, "Authors").fill("CAVALRY team");
    await box(page, "Abstract").fill("A short brief that mentions a programme still in progress.");
    const option = page.getByRole("option", {
      name: new RegExp(`${projectTitle} \\(not public\\)`),
    });
    await select(page, "Programme (optional)").selectOption(
      (await option.getAttribute("value")) ?? "",
    );
    await page.getByRole("button", { name: "Save publication" }).click();
    await page.waitForURL((u) => u.pathname === "/admin/publications");

    const visitor = await browser.newContext();
    const pub = await visitor.newPage();
    await pub.goto("/publications");
    await expect(pub.getByRole("heading", { name: title })).toBeVisible();
    await expect(pub.locator(`a[href="/research/${slug}"]`)).toHaveCount(0);
    await visitor.close();
    await admin.context.close();
    await member.context.close();
  });

  test("bad input is explained and what was typed is kept", async ({ browser }) => {
    const admin = await signedInContext(browser, "admin");
    const page = await admin.context.newPage();
    await page.goto("/admin/publications/new");
    await box(page, "Title").fill("A valid title here");
    await box(page, "Year").fill("26");
    await page
      .getByRole("textbox", { name: "Link (optional)", exact: true })
      .fill("ftp://example.org/paper");
    await page.getByRole("button", { name: "Save publication" }).click();
    await expect(page.getByText("Year: four digits, or leave it empty.")).toBeVisible();
    await expect(
      page.getByText("Link: paste a full https:// link, or leave it empty."),
    ).toBeVisible();
    await expect(box(page, "Title")).toHaveValue("A valid title here");
    await expect(box(page, "Year")).toHaveAttribute("aria-invalid", "true");
    await admin.context.close();
  });

  test("members who are not admins cannot open the content admin", async ({ browser }) => {
    const { context } = await signedInContext(browser, "member");
    const page = await context.newPage();
    for (const path of ["/admin/news", "/admin/publications/new"]) {
      await page.goto(path);
      await page.waitForURL((u) => u.pathname === "/members-only");
    }
    await context.close();
  });
});
