import { chromium, type Browser } from "playwright";
import { describe, it, beforeAll, afterAll } from "vitest";
import { withE2EPage } from "./playwrightArtifacts";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;
const screenshotPath = process.env.E2E_SCREENSHOT_PATH;

describe("Workbench onboarding", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("shows first-run guidance without scan context", async () => {
    await withE2EPage(browser, { baseURL }, async (page) => {
      await page.goto("/workbench", { waitUntil: "domcontentloaded" });

      await page.getByTestId("workbench-scopes-panel").waitFor({ state: "visible" });
      await page.getByRole("heading", { name: /build your agents\.md/i }).waitFor({ state: "visible" });
      await page.getByText(/no scan context yet/i).waitFor({ state: "visible" });
      const main = page.locator("#main-content");
      await main.getByRole("link", { name: /scan a folder/i }).first().waitFor({ state: "visible" });

      if (screenshotPath) {
        await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
        await page.screenshot({ path: screenshotPath, fullPage: true });
      }
    });
  }, 45000);
});
