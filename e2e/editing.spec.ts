import { expect } from "@playwright/test";
import { addToProject, openProject, signedInContext, test } from "./helpers";

test.describe("editing projects", () => {
  test("the leader edits the research plan and the project page shows it", async ({ browser }) => {
    const stamp = Date.now();
    const leader = await signedInContext(browser, "member");
    const page = await leader.context.newPage();
    const path = await openProject(page, `Editable project ${stamp}`);

    await page.getByRole("link", { name: "Edit research plan →" }).click();
    await page.waitForURL((u) => u.pathname === `${path}/edit`);
    await expect(page.getByRole("heading", { name: "Publishing" })).toHaveCount(0);

    await page.getByRole("textbox", { name: "Title" }).fill(`Edited title ${stamp}`);
    await page.getByRole("textbox", { name: /Research areas/ }).fill("Public finance, Climate");
    await page.getByRole("button", { name: "+ Add to Sub-questions & hypotheses" }).click();
    await page.getByRole("textbox", { name: /Label \(e\.g\. Q1\) \(Sub-questions/ }).fill("Q1");
    await page
      .getByRole("textbox", { name: /^Question \(Sub-questions/ })
      .fill("Do health budgets fall after floods?");
    await page
      .getByRole("textbox", { name: /^Hypothesis \(Sub-questions/ })
      .fill("Yes, for about two years.");
    await page
      .getByRole("combobox", { name: "Current stage" })
      .selectOption({ label: "2. Data audit" });
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Saved." })).toBeVisible();

    await page.goto(path);
    await expect(
      page.getByRole("heading", { level: 1, name: `Edited title ${stamp}` }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sub-questions & hypotheses" })).toBeVisible();
    await expect(page.getByText("Do health budgets fall after floods?")).toBeVisible();
    await expect(page.getByText("Public finance · Climate")).toBeVisible();
    await leader.context.close();
  });

  test("bad input is refused with a clear message", async ({ browser }) => {
    const { context } = await signedInContext(browser, "member");
    const page = await context.newPage();
    const path = await openProject(page, `Validation project ${Date.now()}`);
    await page.goto(`${path}/edit`);
    await page.getByRole("textbox", { name: "Title" }).fill("Hi");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Title: at least 5 characters." }),
    ).toBeVisible();
    await context.close();
  });

  test("team members who are not the leader cannot edit", async ({ browser }) => {
    const leader = await signedInContext(browser, "member");
    const mate = await signedInContext(browser, "member");
    const page = await leader.context.newPage();
    const path = await openProject(page, `Read-only project ${Date.now()}`);
    await addToProject(page, path, mate, "Analyst");

    const matePage = await mate.context.newPage();
    await matePage.goto(path);
    await expect(matePage.getByRole("link", { name: "Edit research plan →" })).toHaveCount(0);
    await matePage.goto(`${path}/edit`);
    await expect(
      matePage.getByText("Only the team leader and admins can edit this project."),
    ).toBeVisible();
    await expect(matePage.getByRole("button", { name: "Save changes" })).toHaveCount(0);
    await leader.context.close();
    await mate.context.close();
  });

  test("only admins publish a project to the public site, and can take it down", async ({
    browser,
  }) => {
    const stamp = Date.now();
    const title = `Publishable project ${stamp}`;
    const leader = await signedInContext(browser, "member");
    const leaderPage = await leader.context.newPage();
    const path = await openProject(leaderPage, title);

    const admin = await signedInContext(browser, "admin");
    const page = await admin.context.newPage();
    await page.goto(`${path}/edit`);
    await page.getByRole("combobox", { name: "Status" }).selectOption("completed");
    await page.getByRole("button", { name: "Save status" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Published" })).toBeVisible();

    const visitor = await browser.newContext();
    const pub = await visitor.newPage();
    await pub.goto("/research");
    await expect(pub.getByText(title)).toBeVisible();
    await pub.goto(`/research/${path.split("/").pop()}`);
    await expect(pub.getByRole("heading", { level: 1, name: title })).toBeVisible();

    // The leader sees it is public but cannot change the status.
    await leaderPage.goto(`${path}/edit`);
    await expect(
      leaderPage.getByText("This project is published on the public site."),
    ).toBeVisible();
    await expect(leaderPage.getByRole("combobox", { name: "Status" })).toHaveCount(0);

    // Take it down again.
    await page.getByRole("combobox", { name: "Status" }).selectOption("active");
    await page.getByRole("button", { name: "Save status" }).click();
    await expect(page.getByRole("status").filter({ hasText: "team only" })).toBeVisible();
    await pub.goto("/research");
    await expect(pub.getByText(title)).toHaveCount(0);

    await visitor.close();
    await admin.context.close();
    await leader.context.close();
  });
});
