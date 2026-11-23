import { expect, type Page } from "@playwright/test";
import { signedInContext, test } from "./helpers";

async function fillApplication(page: Page, field = "Public finance") {
  await page.getByLabel("Field", { exact: true }).selectOption(field);
  await page
    .getByLabel("Why do you want to join?")
    .fill(
      "I want to study how governments change spending priorities, and I enjoy careful empirical work with public data.",
    );
  await page
    .getByLabel("Your background")
    .fill("Third-year CSE student with coursework in statistics and Python.");
  await page
    .getByLabel("Sample of your work (optional)")
    .fill("https://github.com/example/project");
  await page.getByLabel("Hours per week").fill("6");
}

test("visitors are asked to sign in before applying", async ({ page }) => {
  await page.goto("/apply");
  await expect(page.getByText("Sign in to apply")).toBeVisible();
  await expect(page.getByRole("link", { name: "Create an account" })).toHaveAttribute(
    "href",
    "/sign-up?next=/apply",
  );
});

test("a user applies, sees the status, and can withdraw", async ({ browser }) => {
  const { context } = await signedInContext(browser, "user");
  const page = await context.newPage();
  await page.goto("/apply");

  // Server-side validation
  await page.getByRole("button", { name: "Send application" }).click();
  await expect(page.getByText("Please fix the highlighted fields.")).toBeVisible();
  await expect(page.getByText("Choose a field.")).toBeVisible();

  await fillApplication(page);
  await page.getByRole("button", { name: "Send application" }).click();
  await expect(page.getByText("Under review")).toBeVisible();
  await expect(page.getByText("Your application for Public finance")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send application" })).toHaveCount(0);

  await page.getByRole("button", { name: "Withdraw application" }).click();
  await expect(page.getByRole("button", { name: "Send application" })).toBeVisible();
  await expect(page.getByText("Withdrawn ·")).toBeVisible();
  await context.close();
});

test("an admin accepts an application and the applicant becomes a member", async ({ browser }) => {
  const applicant = await signedInContext(browser, "user");
  const applicantPage = await applicant.context.newPage();
  await applicantPage.goto("/apply");
  await fillApplication(applicantPage, "Causal inference");
  await applicantPage.getByRole("button", { name: "Send application" }).click();
  await expect(applicantPage.getByText("Under review")).toBeVisible();

  const admin = await signedInContext(browser, "admin");
  const adminPage = await admin.context.newPage();
  await adminPage.goto("/admin/applications");
  const card = adminPage
    .getByRole("article", { name: `Application from ${applicant.name}` })
    .filter({ hasText: applicant.email });
  await expect(card.getByText("Causal inference")).toBeVisible();
  await card.getByRole("button", { name: "Accept as member" }).click();
  await expect(card.getByText(/Accepted by Test Admin/)).toBeVisible();

  await applicantPage.goto("/workspace");
  await expect(applicantPage).toHaveURL(/\/workspace$/);
  await expect(
    applicantPage.getByRole("heading", { name: /composition of public spending/i }),
  ).toBeVisible();

  await applicant.context.close();
  await admin.context.close();
});

test("a rejected applicant sees the team's note", async ({ browser }) => {
  const applicant = await signedInContext(browser, "user");
  const applicantPage = await applicant.context.newPage();
  await applicantPage.goto("/apply");
  await fillApplication(applicantPage);
  await applicantPage.getByRole("button", { name: "Send application" }).click();
  await expect(applicantPage.getByText("Under review")).toBeVisible();

  const admin = await signedInContext(browser, "admin");
  const adminPage = await admin.context.newPage();
  await adminPage.goto("/admin/applications");
  const card = adminPage
    .getByRole("article", { name: `Application from ${applicant.name}` })
    .filter({ hasText: applicant.email });
  await card.getByLabel(/Note to/).fill("Please apply again once you have a work sample.");
  await card.getByRole("button", { name: "Reject" }).click();
  await expect(card.getByText(/Not accepted by Test Admin/)).toBeVisible();

  await applicantPage.reload();
  await expect(applicantPage.getByText(/Not accepted ·/)).toBeVisible();
  await expect(
    applicantPage.getByText("Note from the team: Please apply again once you have a work sample."),
  ).toBeVisible();
  await expect(applicantPage.getByRole("button", { name: "Send application" })).toBeVisible();

  await applicant.context.close();
  await admin.context.close();
});

test("members don't see the application form", async ({ browser }) => {
  const { context } = await signedInContext(browser, "member");
  const page = await context.newPage();
  await page.goto("/apply");
  await expect(page.getByText("You're already a member")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send application" })).toHaveCount(0);
  await context.close();
});

test("non-admins cannot open the review page", async ({ browser }) => {
  const { context } = await signedInContext(browser, "member");
  const page = await context.newPage();
  await page.goto("/admin/applications");
  await page.waitForURL((u) => u.pathname === "/members-only");
  await context.close();
});
