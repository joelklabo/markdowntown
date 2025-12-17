import path from "node:path";
import fs from "node:fs/promises";
import type { Browser, BrowserContext, Page } from "playwright";
import { expect } from "vitest";

function slugify(input: string): string {
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned.length > 0 ? cleaned.slice(0, 80) : "unknown";
}

function artifactsDir(label?: string): string {
  const testName = expect.getState().currentTestName ?? "unknown";
  const testSlug = slugify(testName);
  const labelSlug = label ? slugify(label) : undefined;
  return path.join(process.cwd(), "test-results", "e2e", labelSlug ? `${testSlug}__${labelSlug}` : testSlug);
}

export async function withE2EPage(
  browser: Browser,
  contextOptions: Parameters<Browser["newContext"]>[0],
  fn: (page: Page, context: BrowserContext) => Promise<void>,
  label?: string
) {
  const dir = artifactsDir(label);
  await fs.mkdir(dir, { recursive: true });

  const context = await browser.newContext(contextOptions);
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  const page = await context.newPage();

  let error: unknown;
  try {
    await fn(page, context);
  } catch (caught) {
    error = caught;
    await page
      .screenshot({
        path: path.join(dir, "failure.png"),
        fullPage: true,
      })
      .catch(() => {});
  } finally {
    if (error) {
      await context.tracing.stop({ path: path.join(dir, "trace.zip") }).catch(() => {});
    } else {
      await context.tracing.stop().catch(() => {});
    }
    await context.close().catch(() => {});
  }

  if (error) throw error;
}

