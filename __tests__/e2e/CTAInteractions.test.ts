import { chromium, Browser } from "playwright";
import { describe, it, beforeAll, afterAll, expect } from "vitest";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;

describe("CTA interactions", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("landing cards and library CTAs respond", async () => {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();

    // Landing: browse CTA
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: /browse library/i }).first().click();
    expect(page.url()).toMatch(/\/browse/);

    // Library card actions (uses sample/public data)
    const firstCardCopy = page.getByRole("button", { name: /copy/i }).first();
    await firstCardCopy.click();

    const builderButton = page.getByRole("link", { name: /open builder/i }).first();
    await builderButton.click();
    expect(page.url()).toMatch(/\/builder/);

    await context.close();
  }, 45000);
});
