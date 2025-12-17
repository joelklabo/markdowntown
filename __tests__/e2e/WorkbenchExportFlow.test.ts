import { chromium, Browser } from "playwright";
import { describe, it, beforeAll, afterAll } from "vitest";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;

describe("Workbench export flow", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("export produces expected filenames", async () => {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();

    await page.goto("/workbench", { waitUntil: "domcontentloaded" });

    await page.getByText("Scopes").waitFor({ state: "visible" });

    await page.getByRole("button", { name: /add scope/i }).click();
    await page.getByLabel("Scope glob pattern").fill("src/**/*.ts");
    await page.getByRole("button", { name: /^add$/i }).click();

    await page.getByText("src/**/*.ts").waitFor({ state: "visible" });

    await page.getByRole("button", { name: /^\+ add$/i }).click();

    await page.getByLabel("Block title").fill("My Block");
    await page.getByPlaceholder(/write markdown instructions/i).fill("Hello from scope");

    await page.getByLabel("GitHub Copilot").click();
    await page.getByRole("button", { name: /^compile$/i }).click();

    await page.getByText("Manifest").waitFor({ state: "visible" });
    await page.getByRole("button", { name: "src-ts.instructions.md" }).waitFor({ state: "visible" });

    await context.close();
  }, 60000);
});

