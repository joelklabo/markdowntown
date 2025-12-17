import { test, expect } from "@playwright/test";

test.describe("Home page visual", () => {
  test("desktop snapshot", async ({ page }) => {
    await page.goto("/");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });
    await expect(page).toHaveScreenshot("home-desktop.png");
  });

  test("mobile snapshot", async ({ page }) => {
    await page.goto("/");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });
    await expect(page).toHaveScreenshot("home-mobile.png");
  });
});
