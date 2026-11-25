import { expect } from "@playwright/test";
import {
  openProject,
  signedInContext,
  test,
  uniqueEmail,
  PASSWORD,
  visitorHeaders,
} from "./helpers";

test.describe("projects", () => {
  test("a member opens a project and becomes its leader", async ({ browser }) => {
    const leader = await signedInContext(browser, "member");
    const page = await leader.context.newPage();
    const title = `Flood finance ${Date.now()}`;
    const path = await openProject(page, title);

    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Research question" })).toBeVisible();
    // Empty sections stay hidden on a new project.
    await expect(page.getByRole("heading", { name: "Proposed design" })).toHaveCount(0);
    await expect(page.getByText(`${leader.name} · Leader, Principal investigator`)).toBeVisible();

    await page.goto("/workspace");
    const card = page.getByRole("listitem").filter({ hasText: title });
    await expect(card.getByText("Your team")).toBeVisible();
    await expect(card.getByRole("link", { name: /Open project/ })).toHaveAttribute("href", path);
    await leader.context.close();
  });

  test("the form explains what is wrong", async ({ browser }) => {
    const { context } = await signedInContext(browser, "member");
    const page = await context.newPage();
    await page.goto("/workspace/projects/new");
    await page.getByLabel("Project title").fill("Hi");
    await page.getByRole("button", { name: "Open project" }).click();
    await expect(page.getByText("Please fix the highlighted fields.")).toBeVisible();
    await expect(page.getByLabel("Project title")).toHaveAttribute("aria-invalid", "true");
    await context.close();
  });

  test("other members see only the title until they are added", async ({ browser }) => {
    const leader = await signedInContext(browser, "member");
    const other = await signedInContext(browser, "member");
    const title = `Drought budgets ${Date.now()}`;
    const leaderPage = await leader.context.newPage();
    const path = await openProject(leaderPage, title);

    const otherPage = await other.context.newPage();
    await otherPage.goto(path);
    await expect(otherPage.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(otherPage.getByText(`ask ${leader.name}, the team leader`)).toBeVisible();
    expect(await otherPage.content()).not.toContain("Secret question");
    await otherPage.goto(`${path}/team`);
    await expect(otherPage.getByText(/visible only to its team/)).toBeVisible();
    await expect(otherPage.getByText(leader.email)).toHaveCount(0);

    // The leader adds them with a role, then changes it.
    await leaderPage.goto(`${path}/team`);
    await leaderPage.getByLabel("Member", { exact: true }).selectOption({
      label: `${other.name} (${other.email})`,
    });
    await leaderPage.getByLabel("Role on this project").fill("Data engineer");
    await leaderPage.getByRole("button", { name: "Add member" }).click();
    await expect(leaderPage.getByRole("status").filter({ hasText: "Member added." })).toBeVisible();

    const row = leaderPage.getByRole("listitem").filter({ hasText: other.email });
    await row.getByLabel(`Project role for ${other.name}`).fill("Lead analyst");
    await row.getByRole("button", { name: "Save role" }).click();
    await expect(row.getByRole("status")).toHaveText("Role updated.");

    // Now they can read it, but cannot manage the team.
    await otherPage.goto(path);
    await expect(otherPage.getByText("Secret question")).toBeVisible();
    await otherPage.goto(`${path}/team`);
    await expect(otherPage.getByText("Lead analyst")).toBeVisible();
    await expect(otherPage.getByRole("button", { name: "Add member" })).toHaveCount(0);
    await expect(otherPage.getByRole("button", { name: /Save role/ })).toHaveCount(0);

    await leader.context.close();
    await other.context.close();
  });

  test("an invite link makes a new person a member of the project, once", async ({ browser }) => {
    const leader = await signedInContext(browser, "member");
    const leaderPage = await leader.context.newPage();
    const title = `Cyclone recovery ${Date.now()}`;
    const path = await openProject(leaderPage, title);

    await leaderPage.goto(`${path}/team`);
    await leaderPage.getByLabel("Role for the invitee").fill("Research assistant");
    await leaderPage.getByRole("button", { name: "Create invite link" }).click();
    const link = await leaderPage.getByLabel("Invite link").inputValue();
    expect(link).toMatch(/\/invite\/[A-Za-z0-9_-]{40,}$/);
    await expect(leaderPage.getByText("Open invites")).toBeVisible();

    // Someone with a brand-new account (not a member) accepts it.
    const guest = await browser.newContext({ extraHTTPHeaders: visitorHeaders() });
    const guestPage = await guest.newPage();
    await guestPage.goto(new URL(link).pathname);
    await guestPage.waitForURL((u) => u.pathname === "/sign-in");
    await guestPage.goto(`/sign-up?next=${encodeURIComponent(new URL(link).pathname)}`);
    await guestPage.getByLabel("Full name").fill("Invited Person");
    await guestPage.getByLabel("Email").fill(uniqueEmail("invitee"));
    await guestPage.getByLabel("Password").fill(PASSWORD);
    await guestPage.getByRole("button", { name: "Create account" }).click();
    await guestPage.waitForURL((u) => u.pathname.startsWith("/invite/"));
    await expect(guestPage.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(guestPage.getByText("Research assistant")).toBeVisible();
    expect(await guestPage.content()).not.toContain("Secret question");
    await guestPage.getByRole("button", { name: "Accept and join the project" }).click();
    await guestPage.waitForURL((u) => u.pathname === path);
    await expect(guestPage.getByText("Secret question")).toBeVisible();
    await expect(guestPage.getByText("Invited Person · Research assistant")).toBeVisible();

    // The link cannot be used again by someone else.
    const late = await signedInContext(browser, "user");
    const latePage = await late.context.newPage();
    await latePage.goto(new URL(link).pathname);
    await expect(
      latePage.getByRole("heading", { name: "This invite link is not valid" }),
    ).toBeVisible();

    await guest.close();
    await late.context.close();
    await leader.context.close();
  });

  test("a revoked invite stops working", async ({ browser }) => {
    const leader = await signedInContext(browser, "member");
    const page = await leader.context.newPage();
    const path = await openProject(page, `Heatwave health ${Date.now()}`);
    await page.goto(`${path}/team`);
    await page.getByLabel("Role for the invitee").fill("Reviewer");
    await page.getByRole("button", { name: "Create invite link" }).click();
    const link = await page.getByLabel("Invite link").inputValue();
    await page.getByRole("button", { name: "Revoke invite for Reviewer" }).click();
    await expect(page.getByText("Open invites")).toHaveCount(0);

    const user = await signedInContext(browser, "user");
    const userPage = await user.context.newPage();
    await userPage.goto(new URL(link).pathname);
    await expect(
      userPage.getByRole("heading", { name: "This invite link is not valid" }),
    ).toBeVisible();
    await user.context.close();
    await leader.context.close();
  });

  test("leadership can be handed over", async ({ browser }) => {
    const leader = await signedInContext(browser, "member");
    const next = await signedInContext(browser, "member");
    const page = await leader.context.newPage();
    const path = await openProject(page, `River erosion ${Date.now()}`);
    await page.goto(`${path}/team`);
    await page.getByLabel("Member", { exact: true }).selectOption({
      label: `${next.name} (${next.email})`,
    });
    await page.getByLabel("Role on this project").fill("Analyst");
    await page.getByRole("button", { name: "Add member" }).click();
    await page.getByRole("button", { name: `Make leader (${next.name})` }).click();

    // The old leader can still read the project but no longer manages it.
    await expect(page.getByRole("button", { name: "Add member" })).toHaveCount(0);
    const nextPage = await next.context.newPage();
    await nextPage.goto(`${path}/team`);
    await expect(nextPage.getByRole("button", { name: "Add member" })).toBeVisible();
    await leader.context.close();
    await next.context.close();
  });
});
