import { chromium, Browser } from "playwright";
import { describe, it, beforeAll, afterAll, expect } from "vitest";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;

describe("LibraryCard interactions", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("snippet card copy CTA updates state", { timeout: 45000 }, async () => {
    const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    await page.goto("/browse?type=snippet", { waitUntil: "domcontentloaded" });

    const firstCopy = page.getByRole("button", { name: /^copy$/i }).first();
    await firstCopy.waitFor({ state: "visible" });
    await firstCopy.click();

    await expect(page.getByRole("button", { name: /copied/i }).first()).toBeVisible();

    await context.close();
  });
});

