import { chromium, Browser } from "playwright";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const headless = true;

describe("Publish artifact flow", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = process.env.E2E_TEST_USER ? it : it.skip;

  maybe("publishes an artifact, verifies visibility, and finds it in Library", async () => {
    const context = await browser.newContext({
      baseURL,
      storageState: process.env.E2E_STORAGE_STATE ?? undefined,
    });
    const page = await context.newPage();

    const title = `E2E Publish ${Date.now()}`;

    await page.goto("/workbench", { waitUntil: "domcontentloaded" });
    await page.getByLabel(/agent title/i).fill(title);
    await page.getByLabel(/visibility/i).selectOption("PRIVATE");

    const firstSave = page.waitForResponse(
      (res) => res.url().includes("/api/artifacts/save") && res.request().method() === "POST" && res.ok()
    );
    await page.getByRole("button", { name: /^save$/i }).click();
    const firstSaveRes = await firstSave;
    const firstSaveJson = (await firstSaveRes.json()) as { id?: string };
    const artifactId = firstSaveJson.id;
    expect(artifactId).toBeTruthy();

    await page.getByText(/cloud: saved/i).waitFor({ state: "visible" });

    // Unauthenticated reads should be forbidden while PRIVATE.
    const privateRes = await fetch(`${baseURL}/api/artifacts/${artifactId}`);
    expect(privateRes.status).toBe(403);

    // Publish as PUBLIC (creates a new version).
    await page.getByLabel(/visibility/i).selectOption("PUBLIC");
    const publishSave = page.waitForResponse(
      (res) => res.url().includes("/api/artifacts/save") && res.request().method() === "POST" && res.ok()
    );
    await page.getByRole("button", { name: /^save$/i }).click();
    await publishSave;
    await page.getByText(/cloud: saved/i).waitFor({ state: "visible" });

    const publicRes = await fetch(`${baseURL}/api/artifacts/${artifactId}`);
    expect(publicRes.status).toBe(200);

    const versionsRes = await fetch(`${baseURL}/api/artifacts/${artifactId}/versions`);
    expect(versionsRes.status).toBe(200);
    const versionsJson = (await versionsRes.json()) as { versions?: unknown[] };
    expect(Array.isArray(versionsJson.versions)).toBe(true);
    expect(versionsJson.versions?.length ?? 0).toBeGreaterThanOrEqual(2);

    const publicContext = await browser.newContext({ baseURL });
    const publicPage = await publicContext.newPage();
    await publicPage.goto(`/library?q=${encodeURIComponent(title)}`, { waitUntil: "domcontentloaded" });
    await publicPage.getByText(title).first().waitFor({ state: "visible" });

    await publicContext.close();
    await context.close();
  }, 90000);
});

