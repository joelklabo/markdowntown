import { chromium, type Browser } from "playwright";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { withE2EPage } from "./playwrightArtifacts";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;

describe("Atlas simulator flow", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("switches tools and updates loaded files", { timeout: 45000 }, async () => {
    await withE2EPage(browser, { baseURL, viewport: { width: 1280, height: 900 } }, async (page) => {
      await page.goto("/atlas/simulator", { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { name: /^simulator$/i }).first().waitFor({ state: "visible" });

      const loadedList = page.getByRole("list", { name: /loaded files/i });
      await loadedList.waitFor({ state: "visible" });

      const simulate = page.getByRole("button", { name: /^simulate$/i });

      // Default tool: GitHub Copilot.
      await simulate.click();
      await loadedList.getByText(".github/copilot-instructions.md", { exact: true }).waitFor({ state: "visible" });
      const copilotText = (await loadedList.allTextContents()).join("\n");
      expect(copilotText.trim().length).toBeGreaterThan(0);

      // Switch to Codex CLI and re-run simulation.
      await page.getByLabel("Tool", { exact: true }).selectOption("codex-cli");
      await simulate.click();
      await loadedList.getByText("AGENTS.md", { exact: true }).waitFor({ state: "visible" });

      const codexText = (await loadedList.allTextContents()).join("\n");
      expect(codexText.trim().length).toBeGreaterThan(0);
      expect(codexText).not.toEqual(copilotText);
    }, "atlas-simulator");
  });
});
