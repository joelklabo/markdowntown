import { chromium, Browser } from "playwright";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const headless = true;

describe("Authenticated artifact flow", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = process.env.E2E_TEST_USER ? it : it.skip;

  maybe("signs in (storage) and saves an artifact from Workbench", async () => {
    const context = await browser.newContext({
      baseURL,
      storageState: process.env.E2E_STORAGE_STATE ?? undefined,
    });
    const page = await context.newPage();

    await page.goto("/workbench", { waitUntil: "domcontentloaded" });

    await page.getByLabel(/agent title/i).fill("E2E Artifact");
    await page.getByRole("button", { name: /^save$/i }).click();

    await expect(page.getByText(/cloud: saved/i)).toBeVisible();

    await context.close();
  }, 60000);
});

