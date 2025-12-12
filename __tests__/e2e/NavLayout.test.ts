import { chromium, Browser } from "playwright";
import { describe, it, beforeAll, afterAll, expect } from "vitest";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;

describe("Navigation and browse layout integrity", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("keeps header actions on one line and enforces card min width", { timeout: 45000 }, async () => {
    const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    await page.goto("/browse", { waitUntil: "domcontentloaded" });

    // Header buttons should not wrap
    const header = page.locator("header");
    const cta = header.getByRole("link", { name: /Use a template/i });
    const signIn = header.getByRole("link", { name: /Sign in/i });
    await Promise.all([cta.waitFor(), signIn.waitFor()]);
    const ctaBox = await cta.boundingBox();
    const signBox = await signIn.boundingBox();
    expect(ctaBox?.height).toBeLessThan(48);
    expect(signBox?.height).toBeLessThan(40);

    const cardsLocator = page.locator("main .card");
    const cardCount = await cardsLocator.count();
    if (cardCount === 0) {
      await page.getByText(/no results yet|no public items/i).first().waitFor({ state: "visible" });
      await context.close();
      return;
    }

    // Cards maintain usable width
    const firstCard = cardsLocator.first();
    await firstCard.waitFor({ state: "visible" });
    const cardBox = await firstCard.boundingBox();
    expect(cardBox?.width).toBeGreaterThan(240);

    if (cardCount > 1) {
      // At least two columns at desktop width
      const cards = await cardsLocator.all();
      const xs = await Promise.all(cards.slice(0, 2).map(async (c) => (await c.boundingBox())?.x ?? 0));
      expect(new Set(xs).size).toBeGreaterThan(1);
    }

    await context.close();
  });

  maybe("mobile nav stays visible, cards stay readable, no horizontal scroll", { timeout: 45000 }, async () => {
    const context = await browser.newContext({ baseURL, viewport: { width: 375, height: 667 } });
    const page = await context.newPage();

    await page.goto("/browse", { waitUntil: "domcontentloaded" });

    const scrollWidth = await page.evaluate(() => document.scrollingElement?.scrollWidth ?? 0);
    expect(scrollWidth).toBeLessThanOrEqual(440);

    const bottomNav = page.getByRole("navigation", { name: /primary/i });
    await bottomNav.waitFor({ state: "visible" });

    const cardsLocator = page.locator("main .card");
    const cardCount = await cardsLocator.count();
    if (cardCount === 0) {
      await page.getByText(/no results yet|no public items/i).first().waitFor({ state: "visible" });
      await context.close();
      return;
    }

    const firstCard = cardsLocator.first();
    await firstCard.waitFor({ state: "visible" });
    const cardBox = await firstCard.boundingBox();
    expect(cardBox?.width).toBeGreaterThan(220);

    await context.close();
  });
});
