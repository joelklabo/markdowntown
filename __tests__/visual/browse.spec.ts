import { test, expect } from "@playwright/test";
import { gotoVisualPage } from "./utils";

test.describe("Browse page visual", () => {
  test("desktop snapshot", async ({ page }) => {
    await gotoVisualPage(page, "/library");
    await expect(page).toHaveScreenshot("browse-desktop.png");
  });

  test("mobile snapshot", async ({ page }) => {
    await gotoVisualPage(page, "/library");
    await expect(page).toHaveScreenshot("browse-mobile.png");
  });
});
