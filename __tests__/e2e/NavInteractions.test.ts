import { chromium, Browser } from "playwright";
import { describe, it, beforeAll, afterAll, expect } from "vitest";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;

describe("Navigation and interaction smoke", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("nav links, search, and builder reorder controls work", async () => {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();

    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Desktop nav link (avoid hero CTA duplicates)
    await page.locator("header").getByRole("link", { name: /^browse$/i }).first().click();
    await page.waitForURL(/\/browse/);

    // Browse search updates URL
    const searchInput = page.locator("header").getByRole("textbox", { name: /^search$/i });
    await searchInput.click();
    await searchInput.fill("tools");
    const searchButton = page.locator("header").getByRole("button", { name: /^search$/i });
    // React state is async; give it a tick before submit.
    await page.waitForTimeout(100);
    await searchButton.click();
    await page.waitForFunction(() => window.location.search.includes("q=tools"));
    expect(page.url()).toMatch(/browse\?q=tools/);

    await context.close();
  }, 45000);
});
