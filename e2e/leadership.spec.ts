import { expect, type Page } from "@playwright/test";
import { addToProject, openProject, signedInContext, test } from "./helpers";

const row = (page: Page, email: string) => page.getByRole("listitem").filter({ hasText: email });

async function addAs(
  page: Page,
  path: string,
  person: { name: string; email: string },
  role: string,
  position: "Member" | "Co-leader" | "Leader",
) {
  await page.goto(`${path}/team`);
  await page.getByLabel("Member", { exact: true }).selectOption({
    label: `${person.name} (${person.email})`,
  });
  await page.getByLabel("Role on this project").fill(role);
  await page
    .getByRole("region", { name: /Add a member/ })
    .getByLabel("Position")
    .selectOption({ label: position });
  await page.getByRole("button", { name: "Add member" }).click();
  if (position === "Leader") {
    // Handing over removes the old leader's controls, so wait for the badge.
    await expect(row(page, person.email).getByText("Leader", { exact: true })).toBeVisible();
  } else {
    await expect(page.getByRole("status").filter({ hasText: "Member added." })).toBeVisible();
  }
}

async function invite(page: Page, role: string) {
  await page.getByLabel("Role for the invitee").fill(role);
  await page.getByRole("button", { name: "Create invite link" }).click();
  await page.getByLabel("Invite link").waitFor();
}

test.describe("leaders, co-leaders and slots", () => {
  test("a co-leader runs the members but not the leadership", async ({ browser }) => {
    const stamp = Date.now();
    const leader = await signedInContext(browser, "member", {}, `Lead ${stamp}`);
    const co = await signedInContext(browser, "member", {}, `Co ${stamp}`);
    const member = await signedInContext(browser, "member", {}, `Mem ${stamp}`);
    const page = await leader.context.newPage();
    const path = await openProject(page, `Co-led project ${stamp}`);
    await addAs(page, path, co, "Methods lead", "Co-leader");
    await expect(row(page, co.email).getByText("Co-leader", { exact: true })).toBeVisible();

    const coPage = await co.context.newPage();
    await coPage.goto(`${path}/team`);
    // Co-leaders add plain members only: no position choice.
    await expect(coPage.getByLabel("Position")).toHaveCount(0);
    await addToProject(coPage, path, member, "Analyst");
    await row(coPage, member.email)
      .getByLabel(`Project role for ${member.name}`)
      .fill("Senior analyst");
    await row(coPage, member.email).getByRole("button", { name: "Save role" }).click();
    await expect(row(coPage, member.email).getByRole("status")).toHaveText("Role updated.");

    // …but cannot touch the leader, rate, appoint co-leaders or hand over leadership.
    await expect(row(coPage, leader.email).getByLabel(/Project role for/)).toHaveCount(0);
    await expect(coPage.getByLabel(/Rating for/)).toHaveCount(0);
    await expect(coPage.getByRole("button", { name: /Make co-leader|Make leader/ })).toHaveCount(0);
    await expect(coPage.getByRole("button", { name: "Ask an admin for more slots" })).toHaveCount(
      0,
    );
    await expect(coPage.getByText("Ask the leader if the team needs more slots.")).toBeVisible();

    // Co-leaders can edit the research plan.
    await coPage.goto(path);
    await expect(coPage.getByRole("link", { name: "Edit research plan →" })).toBeVisible();

    for (const c of [leader, co, member]) await c.context.close();
  });

  test("the leader can add a member straight in as the new leader", async ({ browser }) => {
    const stamp = Date.now();
    const leader = await signedInContext(browser, "member", {}, `Old lead ${stamp}`);
    const next = await signedInContext(browser, "member", {}, `New lead ${stamp}`);
    const page = await leader.context.newPage();
    const path = await openProject(page, `Handover project ${stamp}`);
    await addAs(page, path, next, "Project manager", "Leader");

    // The old leader stays on the team as a member, with their role, but no controls.
    await page.goto(`${path}/team`);
    await expect(row(page, next.email).getByText("Leader", { exact: true })).toBeVisible();
    await expect(row(page, leader.email).getByText("Principal investigator")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add member" })).toHaveCount(0);

    const nextPage = await next.context.newPage();
    await nextPage.goto(`${path}/team`);
    await expect(nextPage.getByRole("button", { name: "Add member" })).toBeVisible();
    await leader.context.close();
    await next.context.close();
  });

  test("an invite can make a new person the leader", async ({ browser }) => {
    const stamp = Date.now();
    const leader = await signedInContext(browser, "member");
    const page = await leader.context.newPage();
    const path = await openProject(page, `Invite lead ${stamp}`);
    await page.goto(`${path}/team`);
    await page.getByLabel("Role for the invitee").fill("Programme director");
    await page
      .getByRole("region", { name: /Invite someone new/ })
      .getByLabel("Position")
      .selectOption({ label: "Leader" });
    await page.getByRole("button", { name: "Create invite link" }).click();
    const link = await page.getByLabel("Invite link").inputValue();
    await expect(page.getByText(/Whoever accepts it becomes the leader/)).toBeVisible();

    const newcomer = await signedInContext(browser, "user", {}, `Director ${stamp}`);
    const np = await newcomer.context.newPage();
    await np.goto(new URL(link).pathname);
    await expect(np.getByText(/as the project's new leader/)).toBeVisible();
    await np.getByRole("button", { name: "Accept and join the project" }).click();
    await np.waitForURL((u) => u.pathname === path);
    await np.goto(`${path}/team`);
    await expect(row(np, newcomer.email).getByText("Leader", { exact: true })).toBeVisible();
    await expect(np.getByRole("button", { name: "Add member" })).toBeVisible();
    await leader.context.close();
    await newcomer.context.close();
  });

  test("projects start with 5 slots; the leader asks and an admin approves more", async ({
    browser,
  }) => {
    const stamp = Date.now();
    const title = `Slots project ${stamp}`;
    const leader = await signedInContext(browser, "member");
    const page = await leader.context.newPage();
    const path = await openProject(page, title);
    await page.goto(`${path}/team`);
    await expect(page.getByText("1 of 5 slots in use")).toBeVisible();

    // Open invites hold slots: four of them fill the team.
    for (const r of ["One", "Two", "Three", "Four"]) {
      await page.goto(`${path}/team`);
      await invite(page, `Role ${r}`);
    }
    await page.goto(`${path}/team`);
    await expect(page.getByText(/5 of 5 slots in use/)).toBeVisible();
    await expect(page.getByText("All 5 slots are in use.", { exact: false })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create invite link" })).toHaveCount(0);

    await page.getByLabel("Extra slots").selectOption("2");
    await page
      .getByLabel("Why the team needs them")
      .fill("We need a GIS analyst and an econometrician.");
    await page.getByRole("button", { name: "Ask an admin for more slots" }).click();
    await expect(page.getByText("Waiting for an admin: 2 more slots")).toBeVisible();

    const admin = await signedInContext(browser, "admin");
    const ap = await admin.context.newPage();
    await ap.goto("/admin/slot-requests");
    const card = ap.getByRole("listitem").filter({ hasText: title });
    await expect(card.getByText("5 slots → 7")).toBeVisible();
    await card.getByRole("button", { name: `Approve request for ${title}` }).click();
    // Decided requests move to the "Decided" list.
    await expect(
      ap
        .getByRole("region", { name: /Decided/ })
        .getByRole("listitem")
        .filter({ hasText: title }),
    ).toContainText("approved");

    await page.goto(`${path}/team`);
    await expect(page.getByText(/5 of 7 slots in use/)).toBeVisible();
    await expect(page.getByText(/Last request \(2 more\): approved/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Create invite link" })).toBeVisible();
    await leader.context.close();
    await admin.context.close();
  });

  test("admins set slots directly, never below what is in use or above 10", async ({ browser }) => {
    const member = await signedInContext(browser, "member");
    const mp = await member.context.newPage();
    const path = await openProject(mp, `Admin slots ${Date.now()}`);
    await mp.goto(`${path}/team`);
    await invite(mp, "Placeholder");

    const admin = await signedInContext(browser, "admin");
    const page = await admin.context.newPage();
    await page.goto(`${path}/team`);
    const options = await page.getByLabel("Slots (admin)").locator("option").allTextContents();
    expect(options[0]).toBe("2"); // the leader + one open invite
    expect(options.at(-1)).toBe("10");
    await page.getByLabel("Slots (admin)").selectOption("8");
    await page.getByRole("button", { name: "Set slots" }).click();
    await expect(page.getByText("Slots set to 8.")).toBeVisible();
    await expect(page.getByText(/2 of 8 slots in use/)).toBeVisible();
    await member.context.close();
    await admin.context.close();
  });
});
