import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
// Optional: point at an installed Chrome instead of Playwright's own browser.
const executablePath = process.env.PLAYWRIGHT_CHROME_PATH || undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    launchOptions: { executablePath },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Tests run against the production build: `npm run build` first.
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    // Emails are written here instead of being sent (src/lib/mail/transporter.ts).
    env: { MAIL_OUTBOX_DIR: path.resolve(".mail-outbox") },
  },
});
