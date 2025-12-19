import { chromium, type Browser } from "playwright";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { withE2EPage } from "./playwrightArtifacts";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;

describe("Atlas platform examples zip", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("requests the examples zip via the API", { timeout: 45000 }, async () => {
    await withE2EPage(
      browser,
      { baseURL, viewport: { width: 1280, height: 900 }, acceptDownloads: true },
      async (page) => {
        await page.goto("/atlas/platforms/codex-cli", { waitUntil: "domcontentloaded" });
        await page.getByRole("heading", { name: /^codex cli$/i }).first().waitFor({ state: "visible" });

        const downloadButton = page.locator("main header").getByRole("button", { name: /download example zip/i });

        const [response] = await Promise.all([
          page.waitForResponse((resp) => resp.url().includes("/api/atlas/examples/zip") && resp.request().method() === "POST"),
          downloadButton.click(),
        ]);
        expect(response.status()).toBe(200);
      },
      "atlas-platform-examples"
    );
  });
});
