import { test, expect } from "@playwright/test";
import { gotoLivePage, gotoVisualPage } from "./utils";

const pages = [
  { name: "home", url: "/" },
  { name: "atlas-simulator", url: "/atlas/simulator" },
];

const MIN_BANNER_HEIGHT = 40;
const MIN_NAV_HEIGHT = 48;

test.describe("Header stability", () => {
  for (const { name, url } of pages) {
    test(`${name} header stable (animated)`, async ({ page }) => {
      await gotoLivePage(page, url, { theme: "light" });

      const header = page.getByRole("banner");
      const banner = page.locator(".mdt-site-header-banner");
      const nav = page.locator(".mdt-site-header-nav");

      await expect(header).toBeVisible();
      await expect(banner).toBeVisible();
      await expect(nav).toBeVisible();

      await page.waitForTimeout(5000);

      const bannerHeight = await banner.evaluate((el) => el.getBoundingClientRect().height);
      const navHeight = await nav.evaluate((el) => el.getBoundingClientRect().height);

      expect(bannerHeight).toBeGreaterThan(MIN_BANNER_HEIGHT);
      expect(navHeight).toBeGreaterThan(MIN_NAV_HEIGHT);
    });

    test(`${name} header stable (snapshot)`, async ({ page }) => {
      await gotoVisualPage(page, url, { theme: "light" });

      const header = page.getByRole("banner");
      const banner = page.locator(".mdt-site-header-banner");
      const nav = page.locator(".mdt-site-header-nav");

      await expect(header).toBeVisible();
      await expect(banner).toBeVisible();
      await expect(nav).toBeVisible();

      await page.waitForTimeout(5000);

      const bannerHeight = await banner.evaluate((el) => el.getBoundingClientRect().height);
      const navHeight = await nav.evaluate((el) => el.getBoundingClientRect().height);

      expect(bannerHeight).toBeGreaterThan(MIN_BANNER_HEIGHT);
      expect(navHeight).toBeGreaterThan(MIN_NAV_HEIGHT);

      await expect(header).toHaveScreenshot(`${name}-header.png`);
    });
  }
});
