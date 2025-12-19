import { test, expect } from "@playwright/test";

test.describe("City wordmark visual", () => {
  test("day scene", async ({ page }) => {
    await page.goto("/labs/city-logo?snapshot=1&timeOfDay=0.55");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });
    await expect(page.getByTestId("city-logo-preview")).toBeVisible();
    await expect(page.getByTestId("city-logo-preview")).toHaveScreenshot("wordmark-day.png");
  });

  test("night scene", async ({ page }) => {
    await page.goto("/labs/city-logo?snapshot=1&timeOfDay=0.04");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });
    await expect(page.getByTestId("city-logo-preview")).toBeVisible();
    await expect(page.getByTestId("city-logo-preview")).toHaveScreenshot("wordmark-night.png");
  });

  test("ambulance scene", async ({ page }) => {
    await page.goto("/labs/city-logo?snapshot=1&timeOfDay=0.04&event=ambulance");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });
    await expect(page.getByTestId("city-logo-preview")).toBeVisible();
    await expect(page.locator('[data-testid="city-logo-preview"] rect[fill="rgb(255 84 84)"]')).toHaveCount(1);

    await expect(page.getByTestId("city-logo-preview")).toHaveScreenshot("wordmark-ambulance.png");
  });
});
