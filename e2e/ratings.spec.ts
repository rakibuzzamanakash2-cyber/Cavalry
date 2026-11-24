import { expect } from "@playwright/test";
import { addToProject, openProject, signedInContext, test } from "./helpers";

test.describe("ratings", () => {
  test("the leader rates each member per project; members only see it", async ({ browser }) => {
    const stamp = Date.now();
    const leader = await signedInContext(browser, "member", {}, `Leader ${stamp}`);
    const member = await signedInContext(browser, "member", {}, `Rated ${stamp}`);
    const page = await leader.context.newPage();
    const path = await openProject(page, `Storm surge ${stamp}`);
    await addToProject(page, path, member, "Analyst");

    const row = page.getByRole("listitem").filter({ hasText: member.email });
    await expect(row.getByText("Not rated yet")).toBeAttached();
    await row.getByLabel(`Rating for ${member.name}`).selectOption("4");
    await row.getByRole("button", { name: "Save rating" }).click();
    await expect(row.getByRole("status")).toHaveText("Rating saved.");
    await expect(row.getByText("4 out of 5")).toBeAttached();

    // The leader can't rate themselves.
    const own = page.getByRole("listitem").filter({ hasText: leader.email });
    await expect(own.getByLabel(/Rating for/)).toHaveCount(0);

    // The rated member sees the rating but cannot change it.
    const memberPage = await member.context.newPage();
    await memberPage.goto(`${path}/team`);
    const mine = memberPage.getByRole("listitem").filter({ hasText: member.email });
    await expect(mine.getByText("4 out of 5")).toBeAttached();
    await expect(memberPage.getByLabel(/Rating for/)).toHaveCount(0);
    await expect(memberPage.getByRole("button", { name: "Save rating" })).toHaveCount(0);

    await leader.context.close();
    await member.context.close();
  });

  test("the team page shows an overall rating averaged across projects", async ({ browser }) => {
    const stamp = Date.now();
    const leaderA = await signedInContext(browser, "member", {}, `Lead A ${stamp}`);
    const leaderB = await signedInContext(browser, "member", {}, `Lead B ${stamp}`);
    const person = await signedInContext(browser, "member", {}, `Person ${stamp}`);
    const viewer = await signedInContext(browser, "member", {}, `Viewer ${stamp}`);

    for (const [leader, rating, title] of [
      [leaderA, "4", `Monsoon budgets ${stamp}`],
      [leaderB, "5", `Coastal tax ${stamp}`],
    ] as const) {
      const page = await leader.context.newPage();
      const path = await openProject(page, title);
      await addToProject(page, path, person, "Research assistant");
      const row = page.getByRole("listitem").filter({ hasText: person.email });
      await row.getByLabel(`Rating for ${person.name}`).selectOption(rating);
      await row.getByRole("button", { name: "Save rating" }).click();
      await expect(row.getByRole("status")).toHaveText("Rating saved.");
    }

    // Any member sees the overall rating, but not the other teams' projects.
    const page = await viewer.context.newPage();
    await page.goto("/workspace/team");
    const card = page.locator(`li[id^="person-"]`).filter({ hasText: person.name });
    await expect(card.getByText("4.5 out of 5")).toBeAttached();
    await expect(card.getByText("Overall, from 2 project ratings")).toBeVisible();
    await expect(card.getByText(`Monsoon budgets ${stamp}`)).toBeVisible();
    await expect(card.getByRole("link", { name: `Monsoon budgets ${stamp}` })).toHaveCount(0);
    const fresh = page.locator(`li[id^="person-"]`).filter({ hasText: viewer.name });
    await expect(fresh.getByText("No project ratings yet")).toBeVisible();
    expect(await page.content()).not.toContain("Secret question");

    for (const c of [leaderA, leaderB, person, viewer]) await c.context.close();
  });

  test("signed-in users who are not members cannot see the team page", async ({ browser }) => {
    const { context } = await signedInContext(browser, "user");
    const page = await context.newPage();
    await page.goto("/workspace/team");
    await page.waitForURL((u) => u.pathname === "/members-only");
    await context.close();
  });
});
