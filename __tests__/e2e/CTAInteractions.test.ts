import { chromium, Browser } from "playwright";
import { describe, it, beforeAll, afterAll } from "vitest";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;

describe("CTA interactions", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("landing cards and library CTAs respond", async () => {
    const context = await browser.newContext({ baseURL, permissions: ["clipboard-write"] });
    if (baseURL) {
      await context.grantPermissions(["clipboard-write"], { origin: baseURL });
    }
    const page = await context.newPage();

    // Landing: browse CTA
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator("header").getByRole("link", { name: /^library$/i }).first().click();
    await page.waitForURL(/\/library/);
    await page.getByRole("heading", { name: /library/i }).waitFor({ state: "visible" });

    // Legacy /templates should redirect into Library filters.
    await page.locator("header").getByRole("link", { name: /use a template/i }).first().click();
    await page.waitForURL(/\/library\?type=template/);

    // Library CTAs: copy link + open workbench (if any rows exist).
    const rows = page.getByTestId("artifact-row");
    const rowCount = await rows.count();
    if (rowCount === 0) {
      await page.getByText(/no public items found|no public items/i).first().waitFor({ state: "visible" });
      await context.close();
      return;
    }

    const firstRow = rows.first();
    const copy = firstRow.getByRole("button", { name: /copy link/i }).first();
    await copy.waitFor({ state: "visible" });
    await copy.click();
    await page.getByText(/^copied$/i).first().waitFor({ state: "visible" });

    const openWorkbench = firstRow.getByRole("link", { name: /open workbench/i }).first();
    await openWorkbench.waitFor({ state: "visible" });
    await openWorkbench.click();
    await page.waitForURL(/\/workbench/);

    await context.close();
  }, 45000);
});
