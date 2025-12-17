import { test, expect } from "@playwright/test";

test.describe("Browse page visual", () => {
  test("desktop snapshot", async ({ page }) => {
    await page.goto("/library");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });
    await expect(page).toHaveScreenshot("browse-desktop.png");
  });

  test("mobile snapshot", async ({ page }) => {
    await page.goto("/library");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });
    await expect(page).toHaveScreenshot("browse-mobile.png");
  });
});
