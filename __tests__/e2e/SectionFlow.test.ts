import { chromium, Browser } from "playwright";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

const baseURL = process.env.E2E_BASE_URL;

let browser: Browser;

describe("Section flow", () => {
  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe(
    "shows hero for logged-out user",
    { timeout: 20000 },
    async () => {
      const page = await browser.newPage();
      const res = await page.goto(baseURL!, { waitUntil: "domcontentloaded", timeout: 15000 });
      expect(res?.status()).toBeGreaterThanOrEqual(200);
      expect(res?.status()).toBeLessThan(400);
      const text = await page.getByText("Your little town of reusable Markdown prompts.").textContent();
      expect(text).toBeTruthy();
      await page.close();
    }
  );
});
