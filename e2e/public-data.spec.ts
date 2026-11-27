import { expect, type Page } from "@playwright/test";
import { openProject, signedInContext, test } from "./helpers";

async function addDataset(page: Page, name: string, project?: string) {
  await page.goto("/workspace/datasets/new");
  await page.getByLabel("Dataset name").fill(name);
  await page.getByLabel(/^Link/).fill("https://github.com/example/data");
  await page.getByLabel("What it is").fill("District rainfall, 2000–2024, version 2.");
  await page.getByLabel("What we use it for").fill("Hazard measure for the main models.");
  if (project) {
    const option = page.getByRole("option", { name: new RegExp(project) });
    await page
      .getByLabel("Who can see it")
      .selectOption((await option.getAttribute("value")) ?? "");
  }
  await page.getByRole("button", { name: "Add dataset" }).click();
  await page.waitForURL((u) => u.pathname === "/workspace/datasets");
}

test.describe("public data catalogue", () => {
  test("an admin publishes a dataset; it gets a public page and can be taken down", async ({
    browser,
  }) => {
    const name = `Rainfall panel ${Date.now()}`;
    const admin = await signedInContext(browser, "admin");
    const page = await admin.context.newPage();
    await addDataset(page, name);

    await page.goto("/admin/datasets");
    const row = page.getByTestId("admin-datasets").getByRole("listitem").filter({ hasText: name });
    await expect(row).toContainText("Members only");
    await row.getByRole("button", { name: `Publish ${name}` }).click();
    await expect(row.getByRole("alert")).toHaveText("Choose a licence before publishing.");
    await row.getByLabel(`Licence for ${name}`).selectOption("cc-by-4.0");
    await row.getByRole("button", { name: `Publish ${name}` }).click();
    await expect(row.getByRole("status")).toContainText("is now public");

    const visitor = await browser.newContext();
    const pub = await visitor.newPage();
    await pub.goto("/data");
    await pub.getByRole("link", { name }).click();
    await pub.waitForURL(/\/data\/[a-z0-9-]+$/);
    await expect(pub.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(pub.getByTestId("licence")).toHaveText(/CC BY 4\.0/);
    await expect(pub.getByRole("link", { name: /Download or view the data/ })).toHaveAttribute(
      "href",
      "https://github.com/example/data",
    );
    await expect(pub.getByTestId("citation-text")).toContainText(name);
    const url = pub.url();

    await page.reload();
    await row.getByRole("button", { name: `Unpublish ${name}` }).click();
    await expect(row.getByRole("status")).toContainText("no longer public");
    await pub.goto(url);
    await expect(pub.getByRole("heading", { name: "Page not found" })).toBeVisible();

    await visitor.close();
    await admin.context.close();
  });

  test("a dataset from a project in progress can't be published", async ({ browser }) => {
    const stamp = Date.now();
    const member = await signedInContext(browser, "member");
    const mp = await member.context.newPage();
    const project = `Ongoing study ${stamp}`;
    await openProject(mp, project);
    const name = `Confidential panel ${stamp}`;
    await addDataset(mp, name, project);

    const admin = await signedInContext(browser, "admin");
    const page = await admin.context.newPage();
    await page.goto("/admin/datasets");
    const row = page.getByTestId("admin-datasets").getByRole("listitem").filter({ hasText: name });
    await expect(row).toContainText("Project in progress");
    await expect(row.getByRole("button", { name: /Publish/ })).toHaveCount(0);

    const visitor = await browser.newContext();
    const pub = await visitor.newPage();
    await pub.goto("/data");
    await expect(pub.getByText(name)).toHaveCount(0);
    await visitor.close();
    await admin.context.close();
    await member.context.close();
  });
});
