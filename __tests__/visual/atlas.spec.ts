import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

const HIDE_OVERLAYS = "nextjs-portal{display:none !important;}*{caret-color:transparent !important;}";

async function gotoWithTheme(page: Page, url: string, theme: "light" | "dark") {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((nextTheme) => {
    window.localStorage.setItem("theme", nextTheme);
  }, theme);
  await page.goto(url);
  await page.addStyleTag({ content: HIDE_OVERLAYS });
}

const pages = [
  { name: "atlas", url: "/atlas" },
  { name: "atlas-compare", url: "/atlas/compare" },
  { name: "docs", url: "/docs" },
  { name: "changelog", url: "/changelog" },
  { name: "privacy", url: "/privacy" },
  { name: "terms", url: "/terms" },
];

test.describe("Atlas/docs/legal visuals", () => {
  for (const { name, url } of pages) {
    test(`${name} light`, async ({ page }) => {
      await gotoWithTheme(page, url, "light");
      await expect(page).toHaveScreenshot(`${name}-light.png`);
    });

    test(`${name} dark`, async ({ page }) => {
      await gotoWithTheme(page, url, "dark");
      await expect(page).toHaveScreenshot(`${name}-dark.png`);
    });
  }
});
