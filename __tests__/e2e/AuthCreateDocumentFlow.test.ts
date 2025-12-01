import { chromium, Browser } from "playwright";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const headless = true;

describe("Authenticated snippet + document flow", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = process.env.E2E_TEST_USER ? it : it.skip;

  maybe("signs in (storage), creates snippet, creates document, inserts snippet text, copies preview", async () => {
    const context = await browser.newContext({
      baseURL,
      storageState: process.env.E2E_STORAGE_STATE ?? undefined,
    });
    const page = await context.newPage();

    // Create a snippet
    await page.goto("/snippets/new", { waitUntil: "domcontentloaded" });
    await page.getByLabel(/title/i).fill("E2E Snippet");
    await page.getByLabel(/content|body/i).fill("E2E snippet body **bold**");
    await page.getByLabel(/tags/i).fill("e2e, test");
    await page.getByRole("button", { name: /create/i }).click();
    await expect(page.getByText("E2E Snippet")).toBeVisible();

    const snippetText = (await page.getByText("E2E snippet body").first().textContent()) ?? "E2E snippet body **bold**";

    // Create a document
    await page.goto("/documents/new", { waitUntil: "domcontentloaded" });
    await page.getByLabel(/Title/i).fill("E2E agents.md");
    await page.getByLabel(/agents\.md content/i).fill("# My agents\n\nInitial body");
    await page.getByLabel(/Tags/i).fill("agents, e2e");
    await page.getByRole("button", { name: /create document/i }).click();
    await expect(page.getByText("Edit agents.md")).toBeVisible();

    const contentArea = page.getByLabel(/agents\.md content/i);
    await contentArea.click();
    await contentArea.press("End");
    await contentArea.type(`\n\n${snippetText}`);
    await page.getByRole("button", { name: /save changes/i }).click();

    await page.goto("/builder", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /copy/i }).first().click();
    const preview = await page.locator("main").textContent();
    expect(preview).toContain("E2E snippet body");

    await context.close();
  }, 60000);
});
