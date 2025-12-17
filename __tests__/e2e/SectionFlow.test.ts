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
    "shows logged-out surfaces and library",
    { timeout: 20000 },
    async () => {
      const page = await browser.newPage();
      const home = await page.goto(baseURL!, { waitUntil: "domcontentloaded", timeout: 15000 });
      expect(home?.status()).toBeGreaterThanOrEqual(200);
      expect(home?.status()).toBeLessThan(400);
      await page.getByRole("link", { name: /library/i }).first().waitFor({ state: "visible" });

      const library = await page.goto(`${baseURL}/library`, { waitUntil: "domcontentloaded", timeout: 15000 });
      expect(library?.status()).toBeGreaterThanOrEqual(200);
      expect(library?.status()).toBeLessThan(400);
      await page.getByRole("heading", { name: /library/i }).waitFor({ state: "visible" });

      const builder = await page.goto(`${baseURL}/builder`, { waitUntil: "domcontentloaded", timeout: 15000 });
      expect(builder?.status()).toBeGreaterThanOrEqual(200);
      expect(builder?.status()).toBeLessThan(400);
      await page.getByText(/Assemble your agents\.md/i).waitFor({ state: "visible" });

      await page.close();
    }
  );
});
