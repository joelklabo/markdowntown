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

    async function assertBrowseType(type: "snippet" | "template" | "file") {
      await page.goto(`/browse?type=${type}`, { waitUntil: "domcontentloaded" });

      // If no results, don't fail on missing CTAs.
      const emptyState = page.getByText(/no results yet/i);
      if (await emptyState.isVisible()) return;

      if (type !== "file") {
        const preview = page.getByRole("button", { name: /^preview\b/i }).first();
        await preview.waitFor({ state: "visible" });
        await preview.click();
        await page.getByRole("button", { name: /close preview/i }).first().waitFor({ state: "visible" });
        // close preview
        await page.getByRole("button", { name: /close preview/i }).first().click();
      }

      if (type === "snippet") {
        const copy = page.getByRole("button", { name: /^copy\b/i }).first();
        await copy.waitFor({ state: "visible" });
        await copy.click();
        await page.getByText(/^copied$/i).first().waitFor({ state: "visible" });

        const add = page.getByRole("button", { name: /add .* to builder/i }).first();
        await Promise.all([page.waitForURL(/\/builder\?add=/), add.click()]);
        return;
      }

      if (type === "template") {
        const useTemplate = page.getByRole("button", { name: /^use template\b/i }).first();
        await useTemplate.waitFor({ state: "visible" });
        await Promise.all([page.waitForURL(/\/templates\//), useTemplate.click()]);

        await page.goto("/browse?type=template", { waitUntil: "domcontentloaded" });
        const add = page.getByRole("button", { name: /add .* to builder/i }).first();
        await Promise.all([page.waitForURL(/\/builder\?add=/), add.click()]);
        return;
      }

      const download = page.getByRole("button", { name: /^download\b/i }).first();
      await download.waitFor({ state: "visible" });
      await Promise.all([page.waitForURL(/\/files\//), download.click()]);
    }

    // Landing: browse CTA
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: /browse library/i }).first().click();
    await page.waitForURL(/\/browse/);

    // Browse surfaces: card CTAs
    await assertBrowseType("snippet");
    await assertBrowseType("template");
    await assertBrowseType("file");

    await context.close();
  }, 45000);
});
