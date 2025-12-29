import { test, expect } from "@playwright/test";
import { gotoVisualPage } from "./utils";

test.describe("Translate page visual", () => {
  test("light mode", async ({ page }) => {
    await gotoVisualPage(page, "/translate", { theme: "light" });
    await expect(page.getByRole("heading", { name: /translate instructions into workbench-ready files/i })).toBeVisible();
    await expect(page).toHaveScreenshot("translate-light.png");
  });

  test("dark mode", async ({ page }) => {
    await gotoVisualPage(page, "/translate", { theme: "dark" });
    await expect(page.getByRole("heading", { name: /translate instructions into workbench-ready files/i })).toBeVisible();
    await expect(page).toHaveScreenshot("translate-dark.png");
  });
});
