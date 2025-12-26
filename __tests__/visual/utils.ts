import type { Page } from "@playwright/test";

const HIDE_OVERLAYS = `
nextjs-portal{display:none !important;}
*{caret-color:transparent !important;animation:none !important;transition:none !important;}
`;
const WHATS_NEW_KEY = "mdt_whats_new_dismissed_v2025-12";

type VisualPageOptions = {
  theme?: "light" | "dark";
};

async function prepareVisualPage(page: Page, options: VisualPageOptions = {}) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((opts: VisualPageOptions & { storageKey: string }) => {
    (window as unknown as { __MDT_VISUAL_TEST__?: boolean }).__MDT_VISUAL_TEST__ = true;
    window.localStorage.setItem(opts.storageKey, "1");
    if (opts.theme) {
      window.localStorage.setItem("theme", opts.theme);
    }
  }, { ...options, storageKey: WHATS_NEW_KEY });
}

export async function gotoVisualPage(page: Page, url: string, options: VisualPageOptions = {}) {
  await prepareVisualPage(page, options);
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    const fonts = document.fonts;
    if (!fonts?.ready) return;
    try {
      await fonts.ready;
    } catch {
      /* ignore */
    }
  });
  await page.addStyleTag({ content: HIDE_OVERLAYS });
}

export async function gotoLivePage(page: Page, url: string, options: VisualPageOptions = {}) {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript((opts: VisualPageOptions & { storageKey: string }) => {
    window.localStorage.setItem(opts.storageKey, "1");
    if (opts.theme) {
      window.localStorage.setItem("theme", opts.theme);
    }
  }, { ...options, storageKey: WHATS_NEW_KEY });
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    const fonts = document.fonts;
    if (!fonts?.ready) return;
    try {
      await fonts.ready;
    } catch {
      /* ignore */
    }
  });
}
