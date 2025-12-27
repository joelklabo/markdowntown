import { chromium, type Browser } from "playwright";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { withE2EPage } from "./playwrightArtifacts";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;

describe("Skills section flow", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("filters skills and opens a skill in Workbench", { timeout: 60000 }, async () => {
    await withE2EPage(browser, { baseURL, viewport: { width: 1280, height: 900 } }, async (page) => {
      await page.goto("/skills", { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.getByRole("heading", { name: /^skills$/i }).waitFor({ state: "visible" });

      const advancedFiltersToggle = page.getByRole("button", { name: /advanced filters/i });
      await advancedFiltersToggle.click();

      const clearFilters = page.getByRole("link", { name: "Clear" });

      await page.getByRole("link", { name: "Codex CLI" }).first().click();
      await page.waitForURL(/target=agents-md/);
      await clearFilters.click();
      await page.waitForURL(/\/skills$/);

      await advancedFiltersToggle.click();
      await page.getByRole("link", { name: "GitHub Copilot" }).first().click();
      await page.waitForURL(/target=github-copilot/);
      await clearFilters.click();
      await page.waitForURL(/\/skills$/);

      await advancedFiltersToggle.click();
      await page.getByRole("link", { name: "Claude Code" }).first().click();
      await page.waitForURL(/target=claude-code/);
      await clearFilters.click();
      await page.waitForURL(/\/skills$/);

      const firstCard = page.getByTestId("skill-card").first();
      await firstCard.waitFor({ state: "visible" });

      const skillTitle = (await firstCard.getByRole("heading").textContent())?.trim();
      if (!skillTitle) {
        throw new Error("Expected skill title to be present in the first card.");
      }

      await firstCard.getByRole("link", { name: /view skill/i }).click();
      await page.waitForURL(/\/skills\//);
      await page.getByRole("heading", { name: skillTitle }).waitFor({ state: "visible" });

      await page.getByRole("link", { name: /open in workbench/i }).click();
      await page.waitForURL(/\/workbench\?/);

      await page.getByText("Skills").waitFor({ state: "visible" });
      await page.locator("#skill-title").waitFor({ state: "visible" });
      expect(await page.inputValue("#skill-title")).toContain(skillTitle);
    }, "skills-section");
  });
});
