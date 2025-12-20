import { test, expect } from "@playwright/test";
import { gotoVisualPage } from "./utils";

test.describe("Workbench page visual", () => {
  test("desktop snapshot", async ({ page }) => {
    await gotoVisualPage(page, "/workbench");
    await expect(page.getByLabel("Agent Title")).toBeVisible();
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await expect(page).toHaveScreenshot("workbench-desktop.png");
  });

  test("mobile snapshot", async ({ page }) => {
    await gotoVisualPage(page, "/workbench");
    await expect(page.getByLabel("Agent Title")).toBeVisible();
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await expect(page).toHaveScreenshot("workbench-mobile.png");
  });
});
