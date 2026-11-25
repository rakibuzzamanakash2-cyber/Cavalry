import { expect, type Page } from "@playwright/test";
import { signedInContext, test } from "./helpers";

const box = (page: Page, name: string | RegExp) => page.getByRole("textbox", { name });

test.describe("admin team profiles", () => {
  test("an admin adds a profile, hides it, then deletes it", async ({ browser }) => {
    const name = `Nadia Rahman ${Date.now()}`;
    const admin = await signedInContext(browser, "admin");
    const page = await admin.context.newPage();
    await page.goto("/admin/team/people/new");
    await box(page, "Full name").fill(name);
    await box(page, "Role").fill("Research assistant");
    await box(page, "Focus").fill("Hazard data and mapping");
    await box(page, "Bio").fill("Works on hazard exposure data and the maps behind each study.");
    await box(page, "LinkedIn").fill("https://www.linkedin.com/in/example");
    await page.getByRole("button", { name: "Save profile" }).click();
    await page.waitForURL((u) => u.pathname === "/admin/team");

    const visitor = await browser.newContext();
    const pub = await visitor.newPage();
    await pub.goto("/team");
    const card = pub.getByRole("article").filter({ hasText: name });
    await expect(card).toBeVisible();
    await expect(
      card.getByRole("link", { name: new RegExp(`LinkedIn\\s*: ${name}`) }),
    ).toHaveAttribute("href", "https://www.linkedin.com/in/example");

    await page.getByRole("link", { name: `Edit ${name}` }).click();
    await page.getByRole("checkbox", { name: "Show on the team page" }).uncheck();
    await page.getByRole("button", { name: "Save changes" }).click();
    await page.waitForURL((u) => u.pathname === "/admin/team");
    await expect(
      page.getByRole("listitem").filter({ hasText: name }).getByText("Hidden"),
    ).toBeVisible();
    await pub.goto("/team");
    await expect(pub.getByText(name)).toHaveCount(0);

    await page.getByRole("link", { name: `Edit ${name}` }).click();
    await page.getByRole("button", { name: "Delete profile" }).click();
    await page.waitForURL((u) => u.pathname === "/admin/team");
    await expect(page.getByRole("heading", { name })).toHaveCount(0);
    await visitor.close();
    await admin.context.close();
  });

  test("open roles show on the team page until they are closed", async ({ browser }) => {
    const title = `Spatial data analyst ${Date.now()}`;
    const admin = await signedInContext(browser, "admin");
    const page = await admin.context.newPage();
    await page.goto("/admin/team/roles/new");
    await box(page, "Role title").fill(title);
    await box(page, "Background we're looking for").fill("GIS, raster data and Python.");
    await box(page, "What they would own").fill("Hazard exposure layers for every study.");
    await page.getByRole("button", { name: "Save role" }).click();
    await page.waitForURL((u) => u.pathname === "/admin/team");

    const visitor = await browser.newContext();
    const pub = await visitor.newPage();
    await pub.goto("/team");
    await expect(pub.getByRole("heading", { name: title })).toBeVisible();

    await page.getByRole("link", { name: `Edit ${title}` }).click();
    await page.getByRole("checkbox", { name: /Open/ }).uncheck();
    await page.getByRole("button", { name: "Save changes" }).click();
    await page.waitForURL((u) => u.pathname === "/admin/team");
    await pub.goto("/team");
    await expect(pub.getByRole("heading", { name: title })).toHaveCount(0);
    await visitor.close();
    await admin.context.close();
  });

  test("bad input is explained and what was typed is kept", async ({ browser }) => {
    const admin = await signedInContext(browser, "admin");
    const page = await admin.context.newPage();
    await page.goto("/admin/team/people/new");
    await box(page, "Full name").fill("Kept Name");
    await box(page, "Photo (optional)").fill("javascript:alert(1)");
    await box(page, "Order").fill("first");
    await page.getByRole("checkbox", { name: "Co-founder" }).check();
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByText(/^Photo: an https:\/\/ link/)).toBeVisible();
    await expect(page.getByText("Order: a whole number, e.g. 1, 2, 3.")).toBeVisible();
    await expect(box(page, "Full name")).toHaveValue("Kept Name");
    await expect(page.getByRole("checkbox", { name: "Co-founder" })).toBeChecked();
    await admin.context.close();
  });

  test("members who are not admins cannot edit profiles", async ({ browser }) => {
    const { context } = await signedInContext(browser, "member");
    const page = await context.newPage();
    await page.goto("/admin/team");
    await page.waitForURL((u) => u.pathname === "/members-only");
    await context.close();
  });
});
