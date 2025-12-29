import { test, expect } from "@playwright/test";

test.describe("City wordmark visual", () => {
  test("day scene", async ({ page }) => {
    await page.goto("/labs/city-logo?snapshot=1&timeOfDay=0.55&voxelScale=3&detail=hd");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });
    const preview = page.getByTestId("city-logo-preview");
    await expect(preview).toBeVisible();
    await expect(preview).toHaveAttribute("data-snapshot-ready", "true");
    await expect(preview).toHaveScreenshot("wordmark-day.png", { timeout: 10000 });
  });

  test("night scene", async ({ page }) => {
    await page.goto("/labs/city-logo?snapshot=1&timeOfDay=0.04&voxelScale=3&detail=hd");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });
    const preview = page.getByTestId("city-logo-preview");
    await expect(preview).toBeVisible();
    await expect(preview).toHaveAttribute("data-snapshot-ready", "true");
    await expect(preview).toHaveScreenshot("wordmark-night.png", { timeout: 10000 });
  });

  test("ambulance scene", async ({ page }) => {
    await page.goto("/labs/city-logo?snapshot=1&timeOfDay=0.04&event=ambulance&voxelScale=3&detail=hd");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });
    const preview = page.getByTestId("city-logo-preview");
    await expect(preview).toBeVisible({ timeout: 15000 });
    await expect(preview).toHaveAttribute("data-snapshot-ready", "true");
    await expect(preview).toHaveScreenshot("wordmark-ambulance.png", { timeout: 10000 });
  });
});
