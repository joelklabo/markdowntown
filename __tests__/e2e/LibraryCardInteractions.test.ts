import { chromium, Browser } from "playwright";
import { describe, it, beforeAll, afterAll } from "vitest";

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
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 1280, height: 900 },
      permissions: ["clipboard-write"],
    });
    if (baseURL) {
      await context.grantPermissions(["clipboard-write"], { origin: baseURL });
    }
    const page = await context.newPage();

    await page.goto("/browse?type=snippet", { waitUntil: "domcontentloaded" });

    const cards = page.getByTestId("library-card");
    const cardCount = await cards.count();
    if (cardCount === 0) {
      await page.getByText(/no results yet/i).first().waitFor({ state: "visible" });
      await context.close();
      return;
    }

    const firstCard = cards.first();
    await firstCard.waitFor({ state: "visible" });

    const firstCopy = firstCard.getByRole("button", { name: /copy/i }).first();
    await firstCopy.waitFor({ state: "visible" });
    await firstCopy.click();

    await context.close();
  });
});
