import { test, expect } from "@playwright/test";

test.describe("Detail pages visual", () => {
  test("snippet desktop", async ({ page }) => {
    await page.goto("/snippets/sys-tone");
    await expect(page).toHaveScreenshot("snippet-desktop.png");
  });

  test("snippet mobile", async ({ page }) => {
    await page.goto("/snippets/sys-tone");
    await expect(page).toHaveScreenshot("snippet-mobile.png");
  });

  test("template desktop", async ({ page }) => {
    await page.goto("/templates/agents-template-basic");
    await expect(page).toHaveScreenshot("template-desktop.png");
  });

  test("template mobile", async ({ page }) => {
    await page.goto("/templates/agents-template-basic");
    await expect(page).toHaveScreenshot("template-mobile.png");
  });
});
