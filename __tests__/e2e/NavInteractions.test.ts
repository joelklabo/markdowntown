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

    // Desktop nav link
    await page.getByRole("link", { name: /browse/i }).click();
    expect(page.url()).toMatch(/\/browse/);

    // Search input submits to browse
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const searchInput = page.getByPlaceholder(/Search snippets, templates/i);
    await searchInput.click();
    await searchInput.fill("tools");
    await searchInput.press("Enter");
    expect(page.url()).toMatch(/browse\?q=tools/);

    // Bottom nav search opens modal
    const searchButton = page.getByRole("button", { name: /search/i }).nth(-1);
    await searchButton.click();
    await page.getByRole("dialog", { name: /search/i }).waitFor({ state: "visible" });
    await page.getByRole("button", { name: /Esc|close search/i }).click();

    // Builder arrows (logged-out sample data)
    await page.goto("/builder", { waitUntil: "domcontentloaded" });
    const firstSnippet = page.getByTestId("builder-snippet").first();
    const snippetTitle = (await firstSnippet.textContent())?.trim() ?? "Snippet";
    await firstSnippet.click();
    await page.getByRole("button", { name: /Move down/i }).first().click();
    await page.getByRole("button", { name: /Move up/i }).first().click();
    const previewText = await page.locator("main").innerText();
    expect(previewText).toContain(snippetTitle);

    await context.close();
  }, 45000);
});
