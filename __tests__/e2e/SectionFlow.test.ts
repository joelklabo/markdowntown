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
    "shows logged-out surfaces and browse",
    { timeout: 20000 },
    async () => {
      const page = await browser.newPage();
      const home = await page.goto(baseURL!, { waitUntil: "domcontentloaded", timeout: 15000 });
      expect(home?.status()).toBeGreaterThanOrEqual(200);
      expect(home?.status()).toBeLessThan(400);
      await page.getByRole("link", { name: /browse/i }).waitFor({ state: "visible" });

      const browse = await page.goto(`${baseURL}/browse`, { waitUntil: "domcontentloaded", timeout: 15000 });
      expect(browse?.status()).toBeGreaterThanOrEqual(200);
      expect(browse?.status()).toBeLessThan(400);
      await page.getByRole("heading", { name: /browse snippets/i }).waitFor({ state: "visible" });

      const builder = await page.goto(`${baseURL}/builder`, { waitUntil: "domcontentloaded", timeout: 15000 });
      expect(builder?.status()).toBeGreaterThanOrEqual(200);
      expect(builder?.status()).toBeLessThan(400);
      await page.getByText(/Assemble your agents\.md/i).waitFor({ state: "visible" });

      await page.close();
    }
  );
});
