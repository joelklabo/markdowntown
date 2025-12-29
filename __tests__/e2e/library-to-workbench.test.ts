import { chromium, Browser } from "playwright";
import { describe, it, beforeAll, afterAll } from "vitest";
import { withE2EPage } from "./playwrightArtifacts";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;

describe("Library to Workbench", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("opens workbench from library", { timeout: 90000 }, async () => {
    await withE2EPage(
      browser,
      {
        baseURL,
        viewport: { width: 1280, height: 900 },
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
        if (rowCount === 0) {
          await emptyState.waitFor({ state: "visible" });
          return;
        }

        const firstRow = rows.first();
        const previewButton = firstRow.getByRole("button", { name: /preview/i });
        await previewButton.click();
        await page.getByRole("heading", { name: /preview/i }).waitFor({ state: "visible", timeout: 15000 });
        await page.screenshot({
          path: "docs/screenshots/core-flows/library-flow.png",
          fullPage: true,
        });
        await page.keyboard.press("Escape");

        const openLink = firstRow.getByRole("link", { name: /open in workbench/i });
        await openLink.click();

        await page.waitForURL(/\/workbench/);
        await page.getByText(/library item loaded/i).first().waitFor({ state: "visible", timeout: 20000 });
      }
    );
  });
});
