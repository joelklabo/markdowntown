import { test, expect } from "@playwright/test";
import { gotoVisualPage } from "./utils";

test.describe("Home page visual", () => {
  test("desktop snapshot", async ({ page }) => {
    await gotoVisualPage(page, "/");
    await expect(page).toHaveScreenshot("home-desktop.png");
  });

  test("mobile snapshot", async ({ page }) => {
    await gotoVisualPage(page, "/");
    await expect(page).toHaveScreenshot("home-mobile.png");
  });
});
