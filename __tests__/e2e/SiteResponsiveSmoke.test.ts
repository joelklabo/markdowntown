import { chromium, Browser } from "playwright";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { withE2EPage } from "./playwrightArtifacts";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;

describe("Site responsive smoke", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("desktop flow: home CTA, nav, library search", { timeout: 45000 }, async () => {
    await withE2EPage(browser, { baseURL, viewport: { width: 1280, height: 900 } }, async (page) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      await Promise.all([
        page.getByRole("banner").waitFor({ state: "visible" }),
        page.getByRole("main").waitFor({ state: "visible" }),
        page.getByRole("contentinfo").waitFor({ state: "visible" }),
      ]);

      const browseCta = page.getByRole("button", { name: /browse library/i });
      await browseCta.waitFor({ state: "visible" });
      await browseCta.click();
      await page.waitForURL(/\/library/);

      const header = page.locator("header");
      const searchInput = header.getByRole("textbox", { name: /^search$/i });
      await searchInput.waitFor({ state: "visible" });
      await searchInput.fill("agents");
      const searchButton = header.getByRole("button", { name: /^search$/i });
      await page.waitForTimeout(100);
      await searchButton.click();
      await page.waitForFunction(() => window.location.search.includes("q=agents"));
      expect(page.url()).toMatch(/library\?q=agents/);

      await header.getByRole("link", { name: /^atlas$/i }).first().click();
      await page.waitForURL(/\/atlas/);
      await page.getByRole("heading", { name: /^atlas$/i }).waitFor({ state: "visible" });
    });
  });

  maybe("mobile flow: home CTA, nav, library search, no overflow", { timeout: 45000 }, async () => {
    await withE2EPage(browser, { baseURL, viewport: { width: 360, height: 740 } }, async (page) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      await Promise.all([
        page.getByRole("banner").waitFor({ state: "visible" }),
        page.getByRole("main").waitFor({ state: "visible" }),
        page.getByRole("contentinfo").waitFor({ state: "visible" }),
      ]);

      const browseCta = page.getByRole("button", { name: /browse library/i });
      await browseCta.waitFor({ state: "visible" });
      await browseCta.click();
      await page.waitForURL(/\/library/);

      const scrollWidth = await page.evaluate(
        () => document.scrollingElement?.scrollWidth ?? document.body.scrollWidth
      );
      const innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 32);

      const bottomNav = page.getByRole("navigation", { name: /primary/i });
      await bottomNav.waitFor({ state: "visible" });

      const openSearch = bottomNav.getByRole("button", { name: /open search/i });
      await openSearch.click();

      const searchDialog = page.getByRole("dialog");
      await searchDialog.waitFor({ state: "visible" });
      const searchForm = searchDialog.getByRole("search");
      const searchInput = searchForm.getByRole("textbox", { name: /^search$/i });
      await searchInput.fill("agents");
      const submit = searchForm.getByRole("button", { name: /^search$/i });
      await page.waitForTimeout(100);
      await submit.click();
      await page.waitForFunction(() => window.location.search.includes("q=agents"));
      expect(page.url()).toMatch(/library\?q=agents/);

      await bottomNav.getByRole("link", { name: /^atlas$/i }).click();
      await page.waitForURL(/\/atlas/);
      await page.getByRole("heading", { name: /^atlas$/i }).waitFor({ state: "visible" });
    });
  });
});
