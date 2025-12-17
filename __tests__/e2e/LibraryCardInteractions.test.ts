import { chromium, Browser } from "playwright";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { withE2EPage } from "./playwrightArtifacts";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;

describe("Library interactions", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("artifact row copy CTA updates state", { timeout: 45000 }, async () => {
    await withE2EPage(
      browser,
      { baseURL, viewport: { width: 1280, height: 900 }, permissions: ["clipboard-write"] },
      async (page, context) => {
        if (baseURL) {
          await context.grantPermissions(["clipboard-write"], { origin: baseURL });
        }

        await page.goto("/browse?type=snippet", { waitUntil: "domcontentloaded" });
        expect(page.url()).toMatch(/\/library/);

        const rows = page.getByTestId("artifact-row");
        const rowCount = await rows.count();
        if (rowCount === 0) {
          await page.getByText(/no public items found|no public items/i).first().waitFor({ state: "visible" });
          return;
        }

        const firstRow = rows.first();
        await firstRow.waitFor({ state: "visible" });

        const firstCopy = firstRow.getByRole("button", { name: /copy link/i }).first();
        await firstCopy.waitFor({ state: "visible" });
        await firstCopy.click();
        await page.getByText(/^copied$/i).first().waitFor({ state: "visible" });
      }
    );
  });
});
