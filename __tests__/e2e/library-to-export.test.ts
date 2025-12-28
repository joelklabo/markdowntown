import { chromium, Browser } from "playwright";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { withE2EPage } from "./playwrightArtifacts";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;
const screenshotPath = process.env.E2E_SCREENSHOT_PATH;

describe("Library to export", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("opens workbench and exports from library", { timeout: 90000 }, async () => {
    await withE2EPage(
      browser,
      {
        baseURL,
        viewport: { width: 1280, height: 900 },
        acceptDownloads: true,
      },
      async (page) => {
        await page.goto("/library", { waitUntil: "domcontentloaded" });
        const rows = page.getByTestId("artifact-row");
        const emptyState = page
          .getByRole("heading", { name: /no public items match those filters|no public items/i })
          .first();

        await Promise.race([
          rows.first().waitFor({ state: "visible", timeout: 15000 }),
          emptyState.waitFor({ state: "visible", timeout: 15000 }),
        ]);

        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThan(0);

        const agentsRow = rows.filter({ hasText: "AGENTS.md" });
        const targetRow = (await agentsRow.count()) > 0 ? agentsRow.first() : rows.first();
        const openLink = targetRow.getByRole("link", { name: /open in workbench/i });
        await openLink.click();

        await page.waitForURL(/\/workbench/);
        await page.getByTestId("workbench-scopes-panel").waitFor({ state: "visible", timeout: 20000 });
        await page.getByRole("button", { name: /^compile$/i }).first().waitFor({ state: "visible", timeout: 20000 });

        const editorPanel = page.locator("#workbench-editor-panel");
        const addBlockButton = editorPanel.getByRole("button", { name: /add a block/i }).first();
        if ((await addBlockButton.count()) > 0 && (await addBlockButton.isVisible())) {
          await addBlockButton.click();
        }
        const openFirstBlock = editorPanel.getByRole("button", { name: /open first block/i }).first();
        if ((await openFirstBlock.count()) > 0 && (await openFirstBlock.isVisible())) {
          await openFirstBlock.click();
        }

        const blockBody = page.locator("#workbench-block-body");
        await blockBody.waitFor({ state: "visible", timeout: 20000 });
        await blockBody.fill("# Library export test\n\nThis ensures compile outputs.");
        const blockHandle = await blockBody.elementHandle();
        if (blockHandle) {
          await page.waitForFunction((el) => (el as HTMLTextAreaElement).value.length > 0, blockHandle);
        }

        const targetCheckbox = page.getByRole("checkbox", { name: "AGENTS.md" });
        await targetCheckbox.waitFor({ state: "visible" });
        if (!(await targetCheckbox.isChecked())) {
          await targetCheckbox.click({ force: true });
          await page.waitForFunction((el) => (el as HTMLInputElement).checked, await targetCheckbox.elementHandle());
        }

        const compileButton = page.getByRole("button", { name: /^compile$/i }).first();
        const compileHandle = await compileButton.elementHandle();
        if (compileHandle) {
          await page.waitForFunction((button) => !button.hasAttribute("disabled"), compileHandle);
        }
        const compileResponse = page.waitForResponse((response) => {
          return response.url().includes("/api/compile") && response.status() === 200;
        });
        await compileButton.click();
        await compileResponse;

        await page.getByText("Manifest").waitFor({ state: "visible", timeout: 20000 });

        const exportButton = page.getByRole("button", { name: /export/i }).first();
        const exportHandle = await exportButton.elementHandle();
        if (exportHandle) {
          await page.waitForFunction((button) => !button.hasAttribute("disabled"), exportHandle);
        }
        const [download] = await Promise.all([
          page.waitForEvent("download"),
          exportButton.click(),
        ]);

        expect(download.suggestedFilename()).toBe("outputs.zip");

        if (screenshotPath) {
          await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
          await page.screenshot({ path: screenshotPath, fullPage: true });
        }
      }
    );
  });
});
