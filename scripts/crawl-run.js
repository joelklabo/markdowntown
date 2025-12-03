#!/usr/bin/env node
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const base = process.env.BASE_URL || "http://localhost:3000";
const pageList =
  process.env.CRAWL_PAGES?.split(",").map((p) => p.trim()).filter(Boolean) || [
    "/",
    "/browse",
    "/templates",
    "/tags",
    "/docs",
    "/changelog",
    "/privacy",
    "/terms",
    "/signin",
    "/snippets/sys-tone",
    "/templates/agents-template-basic",
    "/files/agents-file-langs",
  ];
const WAIT = Number(process.env.CRAWL_WAIT_MS || 250);
const MAX = Number(process.env.CRAWL_MAX || 150);
const TIMEOUT = Number(process.env.CRAWL_TIMEOUT || 3000);
const OUT = process.env.CRAWL_OUT || "/tmp/crawl.jsonl";
const PER_PAGE_TIMEOUT = Number(process.env.CRAWL_PAGE_TIMEOUT || 60000);
const MIN_VISIBLE = Number(process.env.CRAWL_MIN_VISIBLE || 1);

async function crawlPage(pagePath) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const url = base + pagePath;
  const results = [];
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: PER_PAGE_TIMEOUT });
    const controls = [...(await page.$$("a[href]")), ...(await page.$$("button"))]
      .filter(async (el) => {
        const box = await el.boundingBox();
        return box && box.width >= MIN_VISIBLE && box.height >= MIN_VISIBLE;
      })
      .slice(0, MAX);
    for (const el of controls) {
      const tag = await el.evaluate((n) => n.tagName.toLowerCase());
      const label = await el.evaluate((n) => {
        const text = n.innerText ?? n.textContent ?? "";
        const trimmed = text.trim();
        return trimmed || n.getAttribute("aria-label") || "";
      });
      const href = tag === "a" ? await el.getAttribute("href") : null;
      if (href && href.startsWith("http") && !href.startsWith(base)) continue;
      try {
        await el.click({ timeout: TIMEOUT });
        await page.waitForTimeout(WAIT);
        if (page.url() !== url && href) {
          await page
            .goBack({ waitUntil: "networkidle", timeout: Math.max(5000, PER_PAGE_TIMEOUT / 2) })
            .catch(() => {});
          await page.waitForTimeout(WAIT);
        }
      } catch (err) {
        results.push({
          page: pagePath,
          control: `${tag}:${label}`,
          href,
          error: err instanceof Error ? err.message : String(err),
        });
        if (page.url() !== url) {
          await page.goto(url, { waitUntil: "networkidle", timeout: 10000 }).catch(() => {});
          await page.waitForTimeout(WAIT);
        }
      }
    }
  } catch (err) {
    results.push({
      page: pagePath,
      control: "load",
      error: err instanceof Error ? err.message : String(err),
    });
  }
  results.push(...errors.map((msg) => ({ page: pagePath, control: "pageerror", error: msg })));
  await page.close();
  await browser.close();
  return results;
}

async function main() {
  const outPath = path.resolve(OUT);
  const stream = fs.createWriteStream(outPath, { flags: "w" });
  for (const p of pageList) {
    const res = await crawlPage(p);
    for (const row of res) {
      stream.write(JSON.stringify(row) + "\n");
    }
    await new Promise((resolve) => stream.write("", resolve));
  }
  stream.end();
  console.log(`Crawl written to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
