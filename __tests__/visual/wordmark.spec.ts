import { test, expect } from "@playwright/test";

test.describe("City wordmark visual", () => {
  test("day scene", async ({ page }) => {
    await page.goto("/labs/city-logo?snapshot=1&timeOfDay=0.55&voxelScale=3&detail=hd");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });
    await expect(page.getByTestId("city-logo-preview")).toBeVisible();
    await expect(page.getByTestId("city-logo-preview")).toHaveScreenshot("wordmark-day.png");
  });

  test("night scene", async ({ page }) => {
    await page.goto("/labs/city-logo?snapshot=1&timeOfDay=0.04&voxelScale=3&detail=hd");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });
    await expect(page.getByTestId("city-logo-preview")).toBeVisible();
    await expect(page.getByTestId("city-logo-preview")).toHaveScreenshot("wordmark-night.png");
  });

  test("ambulance scene", async ({ page }) => {
    await page.goto("/labs/city-logo?snapshot=1&timeOfDay=0.04&event=ambulance&voxelScale=3&detail=hd");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });
    await expect(page.getByTestId("city-logo-preview")).toBeVisible({ timeout: 15000 });
    await expect(
      page.locator('[data-testid="city-logo-preview"] :is(rect,path)[fill="rgb(255 84 84)"]')
    ).toHaveCount(1);

    await expect(page.getByTestId("city-logo-preview")).toHaveScreenshot("wordmark-ambulance.png");
  });
});
