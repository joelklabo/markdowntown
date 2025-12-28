import fs from "node:fs/promises";
import JSZip from "jszip";
import { chromium, Browser } from "playwright";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { withE2EPage } from "./playwrightArtifacts";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;

describe("Translate flow", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("selects target, compiles, and downloads outputs", async () => {
    await withE2EPage(
      browser,
      { baseURL, acceptDownloads: true },
      async (page) => {
        page.setDefaultTimeout(120000);
        page.setDefaultNavigationTimeout(120000);

        await page.goto("/translate", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1000);

        await page.getByRole("checkbox", { name: /agents\.md/i }).check();
        await page.getByRole("checkbox", { name: /github copilot/i }).check();

        const input = page.getByPlaceholder(/paste markdown or uam v1 json/i);
        await input.waitFor({ state: "visible" });
        await input.fill("# Translate flow\n\nExample body.");

        const compile = page.getByRole("button", { name: /compile files/i });
        await compile.click();

        await page.locator(".font-mono", { hasText: "AGENTS.md" }).waitFor({ state: "visible" });
        await page.locator(".font-mono", { hasText: ".github/copilot-instructions.md" }).waitFor({ state: "visible" });
        await page.getByRole("link", { name: /open workbench/i }).waitFor({ state: "visible" });

        const [download] = await Promise.all([
          page.waitForEvent("download"),
          page.getByRole("button", { name: /download zip/i }).click(),
        ]);

        const downloadPath = await download.path();
        expect(downloadPath).toBeTruthy();

        const buffer = await fs.readFile(downloadPath!);
        const zip = await JSZip.loadAsync(buffer);
        const entries = Object.values(zip.files)
          .filter((f) => !f.dir)
          .map((f) => f.name);

        expect(entries).toContain("AGENTS.md");
        expect(entries).toContain(".github/copilot-instructions.md");
      },
      "translate-flow"
    );
  }, 120000);
});
