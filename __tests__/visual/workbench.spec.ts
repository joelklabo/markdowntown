import { test, expect } from "@playwright/test";

test.describe("Workbench page visual", () => {
  test("desktop snapshot", async ({ page }) => {
    await page.goto("/workbench");
    await expect(page.getByLabel("Agent Title")).toBeVisible();
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}*{caret-color:transparent !important;}" });
    await expect(page).toHaveScreenshot("workbench-desktop.png");
  });

  test("mobile snapshot", async ({ page }) => {
    await page.goto("/workbench");
    await expect(page.getByLabel("Agent Title")).toBeVisible();
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}*{caret-color:transparent !important;}" });
    await expect(page).toHaveScreenshot("workbench-mobile.png");
  });
});
