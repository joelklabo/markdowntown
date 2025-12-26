import { test, expect } from "@playwright/test";

test.describe("City wordmark motion", () => {
  test("nav banner animates", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });

    const banner = page.locator("header .mdt-wordmark--banner");
    await expect(banner).toBeVisible();
    await expect(banner).toHaveClass(/mdt-wordmark--animated/);

    const twinkle = banner.locator('[data-mtw-anim="twinkle"]').first();
    await expect(twinkle).toHaveCount(1);

    const inlineStyle = await twinkle.getAttribute("style");
    expect(inlineStyle ?? "").toContain("animation-delay");
  });

  test("animates while playing", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/labs/city-logo?seed=motion-smoke&density=dense&timeScale=2&timeOfDay=0.55");
    await page.addStyleTag({ content: "nextjs-portal{display:none !important;}" });

    const preview = page.getByTestId("city-logo-preview");
    await expect(preview).toBeVisible();
    await expect(preview).toHaveAttribute("data-snapshot-ready", "true");

    const viewport = page.viewportSize();
    if (viewport && viewport.width < 600) return;

    await page.waitForTimeout(200);
    const first = await preview.screenshot();

    await page.waitForTimeout(600);
    const second = await preview.screenshot();

    expect(first.equals(second)).toBe(false);
  });
});
