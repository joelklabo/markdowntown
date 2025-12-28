import { chromium, Browser } from "playwright";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { withE2EPage } from "./playwrightArtifacts";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;

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

        const firstRow = rows.first();
        const openLink = firstRow.getByRole("link", { name: /open in workbench/i });
        await openLink.click();

        await page.waitForURL(/\/workbench/);
        await page.getByText(/library item loaded/i).waitFor({ state: "visible", timeout: 20000 });

        const compileButton = page.getByRole("button", { name: /^compile$/i }).first();
        await compileButton.click();

        await page.getByText(/ready to export/i).first().waitFor({ state: "visible", timeout: 20000 });

        const exportButton = page.getByRole("button", { name: /export/i }).first();
        const [download] = await Promise.all([
          page.waitForEvent("download"),
          exportButton.click(),
        ]);

        expect(download.suggestedFilename()).toBe("outputs.zip");
      }
    );
  });
});
