import { test, expect } from "@playwright/test";

test.describe("Detail pages visual", () => {
  test("artifact desktop", async ({ page }) => {
    await page.goto("/a/visual-demo");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });
    await expect(page).toHaveScreenshot("artifact-desktop.png");
  });

  test("artifact mobile", async ({ page }) => {
    await page.goto("/a/visual-demo");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });
    await expect(page).toHaveScreenshot("artifact-mobile.png");
  });
});
