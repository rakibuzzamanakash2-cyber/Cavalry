import { expect, type Page } from "@playwright/test";
import { addToProject, openProject, signedInContext, test } from "./helpers";

async function addDataset(
  page: Page,
  d: { name: string; url: string; usedFor?: string; project?: RegExp },
) {
  await page.goto("/workspace/datasets/new");
  await page.getByLabel("Dataset name").fill(d.name);
  await page.getByLabel(/^Link/).fill(d.url);
  await page.getByLabel("What it is").fill("Annual figures by district, 2000–2024, version 3.");
  await page
    .getByLabel("What we use it for")
    .fill(d.usedFor ?? "Outcome variable for the main models.");
  if (d.project) {
    const option = page.getByRole("option", { name: d.project });
    await page
      .getByLabel("Who can see it")
      .selectOption((await option.getAttribute("value")) ?? "");
  }
  await page.getByRole("button", { name: "Add dataset" }).click();
  await page.waitForURL((u) => u.pathname === "/workspace/datasets");
}

test.describe("datasets", () => {
  test("a member adds a shared dataset that every member can see", async ({ browser }) => {
    const stamp = Date.now();
    const adder = await signedInContext(browser, "member", {}, `Adder ${stamp}`);
    const other = await signedInContext(browser, "member");
    const page = await adder.context.newPage();
    const name = `District budgets ${stamp}`;
    await addDataset(page, { name, url: "https://github.com/cavalry-research/district-budgets" });

    const item = page.locator('li[id^="dataset-"]').filter({ hasText: name });
    await expect(item.getByRole("link", { name: /Open on GitHub/ })).toHaveAttribute(
      "href",
      "https://github.com/cavalry-research/district-budgets",
    );
    await expect(item.getByRole("link", { name: /Open on GitHub/ })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    await expect(item.getByText(`Added by Adder ${stamp}`)).toBeVisible();

    const otherPage = await other.context.newPage();
    await otherPage.goto("/workspace/datasets");
    const seen = otherPage.locator('li[id^="dataset-"]').filter({ hasText: name });
    await expect(seen).toBeVisible();
    // Only the person who added it (or a leader/admin) can edit it.
    await expect(seen.getByRole("link", { name: /^Edit/ })).toHaveCount(0);

    await adder.context.close();
    await other.context.close();
  });

  test("a project's datasets are visible only to its team", async ({ browser }) => {
    const stamp = Date.now();
    const leader = await signedInContext(browser, "member");
    const teammate = await signedInContext(browser, "member", {}, `Mate ${stamp}`);
    const outsider = await signedInContext(browser, "member");
    const page = await leader.context.newPage();
    const title = `Cyclone spending ${stamp}`;
    const path = await openProject(page, title);
    await addToProject(page, path, teammate, "Analyst");

    const name = `Secret cyclone tracks ${stamp}`;
    await addDataset(page, {
      name,
      url: "https://drive.google.com/drive/folders/abc123",
      project: new RegExp(title),
    });
    await expect(
      page.getByRole("heading", { name: new RegExp(`Programme \\d+: ${title}`) }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Open on Google Drive/ })).toBeVisible();

    // It also shows on the project page for the team.
    const matePage = await teammate.context.newPage();
    await matePage.goto(path);
    await expect(matePage.getByRole("heading", { name: name })).toBeVisible();
    await matePage.goto("/workspace/datasets");
    await expect(matePage.getByRole("heading", { name: name })).toBeVisible();

    const outPage = await outsider.context.newPage();
    await outPage.goto("/workspace/datasets");
    await expect(outPage.getByRole("heading", { name: "Datasets", level: 1 })).toBeVisible();
    expect(await outPage.content()).not.toContain(name);

    for (const c of [leader, teammate, outsider]) await c.context.close();
  });

  test("the person who added a dataset can edit and delete it", async ({ browser }) => {
    const stamp = Date.now();
    const { context } = await signedInContext(browser, "member");
    const page = await context.newPage();
    const name = `Rainfall grid ${stamp}`;
    await addDataset(page, { name, url: "https://example.org/rainfall.csv" });

    const item = page.locator('li[id^="dataset-"]').filter({ hasText: name });
    await expect(item.getByRole("link", { name: /Open on the web/ })).toBeVisible();
    await item.getByRole("link", { name: `Edit ${name}` }).click();
    // getByRole skips the hidden copy of the previous page that Next keeps mounted.
    await page
      .getByRole("textbox", { name: "What we use it for" })
      .fill("Rainfall shocks as the treatment variable.");
    await page.getByRole("button", { name: "Save changes" }).click();
    await page.waitForURL((u) => u.pathname === "/workspace/datasets");
    await expect(
      page
        .locator('li[id^="dataset-"]')
        .filter({ hasText: name })
        .getByText("Rainfall shocks as the treatment variable."),
    ).toBeVisible();

    await page
      .locator('li[id^="dataset-"]')
      .filter({ hasText: name })
      .getByRole("link", { name: `Edit ${name}` })
      .click();
    await page.getByRole("button", { name: "Delete dataset" }).click();
    await page.waitForURL((u) => u.pathname === "/workspace/datasets");
    await expect(page.getByRole("heading", { name })).toHaveCount(0);
    await context.close();
  });

  test("links must be full https addresses and errors keep what was typed", async ({ browser }) => {
    const { context } = await signedInContext(browser, "member");
    const page = await context.newPage();
    await page.goto("/workspace/datasets/new");
    await page.getByLabel("Dataset name").fill("Bad link data");
    await page.getByLabel(/^Link/).fill("javascript:alert(1)");
    await page.getByRole("button", { name: "Add dataset" }).click();
    await expect(page.getByText("Paste a full https:// link")).toBeVisible();
    await expect(page.getByLabel("Dataset name")).toHaveValue("Bad link data");
    await expect(page.getByLabel(/^Link/)).toHaveAttribute("aria-invalid", "true");
    await context.close();
  });

  test("people who are not members cannot open datasets", async ({ browser }) => {
    const { context } = await signedInContext(browser, "user");
    const page = await context.newPage();
    await page.goto("/workspace/datasets");
    await page.waitForURL((u) => u.pathname === "/members-only");
    await context.close();
  });
});
