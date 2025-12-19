import { test, expect } from "@playwright/test";

test.describe("City wordmark motion", () => {
  test("animates while playing", async ({ page }) => {
    await page.goto("/labs/city-logo?seed=motion-smoke&density=dense&timeScale=2&timeOfDay=0.55");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });

    const preview = page.getByTestId("city-logo-preview");
    await expect(preview).toBeVisible();

    await page.waitForTimeout(200);
    const first = await preview.screenshot();

    await page.waitForTimeout(600);
    const second = await preview.screenshot();

    expect(first.equals(second)).toBe(false);
  });
});

