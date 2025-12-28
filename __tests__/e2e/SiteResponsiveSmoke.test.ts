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

      const browseLink = page.getByRole("link", { name: /browse (the )?library/i });
      const browseButton = page.getByRole("button", { name: /browse library/i });
      const headerLibrary = page.locator("header").getByRole("link", { name: /^library$/i });
      if ((await browseLink.count()) > 0) {
        await browseLink.first().waitFor({ state: "visible" });
        await browseLink.first().click();
      } else if ((await browseButton.count()) > 0) {
        await browseButton.first().waitFor({ state: "visible" });
        await browseButton.first().click();
      } else {
        await headerLibrary.first().waitFor({ state: "visible" });
        await headerLibrary.first().click();
      }
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

      await header.getByRole("link", { name: /^scan$/i }).first().click();
      await page.waitForURL(/\/atlas/);
      await page.getByRole("heading", { name: /^scan a folder$/i }).waitFor({ state: "visible" });
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

      const browseLink = page.getByRole("link", { name: /browse (the )?library/i });
      const browseButton = page.getByRole("button", { name: /browse library/i });
      const bottomNav = page.getByRole("navigation", { name: /primary/i }).last();
      const bottomLibrary = bottomNav.getByRole("link", { name: /^library$/i });
      if ((await browseLink.count()) > 0) {
        await browseLink.first().waitFor({ state: "visible" });
        await browseLink.first().click();
      } else if ((await browseButton.count()) > 0) {
        await browseButton.first().waitFor({ state: "visible" });
        await browseButton.first().click();
      } else {
        await bottomNav.waitFor({ state: "visible" });
        await bottomLibrary.first().waitFor({ state: "visible" });
        await bottomLibrary.first().click();
      }
      await page.waitForURL(/\/library/);

      const scrollWidth = await page.evaluate(
        () => document.scrollingElement?.scrollWidth ?? document.body.scrollWidth
      );
      const innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 32);

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

      const scanLink = bottomNav.getByRole("link", { name: /^scan$/i });
      await scanLink.waitFor({ state: "visible" });
      const scanHref = await scanLink.getAttribute("href");
      expect(scanHref).toBe("/atlas/simulator");
      await page.goto(scanHref ?? "/atlas/simulator", { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { name: /^scan a folder$/i }).waitFor({ state: "visible" });
    });
  });
});
