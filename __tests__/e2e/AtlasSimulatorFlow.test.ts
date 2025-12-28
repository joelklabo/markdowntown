import { chromium, type Browser } from "playwright";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { withE2EPage } from "./playwrightArtifacts";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;

describe("Atlas simulator flow", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("switches tools and updates loaded files", { timeout: 45000 }, async () => {
    await withE2EPage(browser, { baseURL, viewport: { width: 1280, height: 900 } }, async (page) => {
      await page.addInitScript(() => {
        const makeFile = (name: string) => ({ kind: "file", name });
        const makeDir = (name: string, entries: Array<[string, { kind: string; name: string }]>) => ({
          kind: "directory",
          name,
          entries: async function* entriesGenerator() {
            for (const [entryName, handle] of entries) {
              yield [entryName, handle] as [string, { kind: string; name: string }];
            }
          },
        });

        const root = makeDir("mock-repo", [
          [
            ".github",
            makeDir(".github", [["copilot-instructions.md", makeFile("copilot-instructions.md")]]),
          ],
          ["AGENTS.md", makeFile("AGENTS.md")],
        ]);

        (window as unknown as { showDirectoryPicker?: () => Promise<unknown> }).showDirectoryPicker = async () => root;
      });

      await page.goto("/atlas/simulator", { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { name: /^scan a folder$/i }).first().waitFor({ state: "visible" });

      const loadedList = page.getByRole("list", { name: /loaded files/i });
      await page.getByRole("button", { name: /scan a folder/i }).first().click();
      await loadedList.getByText(".github/copilot-instructions.md", { exact: true }).waitFor({ state: "visible" });
      const copilotText = (await loadedList.allTextContents()).join("\n");
      expect(copilotText.trim().length).toBeGreaterThan(0);

      // Switch to Codex CLI and refresh results.
      await page.getByText(/show advanced settings/i).click();
      await page.getByLabel("Tool", { exact: true }).selectOption("codex-cli");
      const refreshButtons = page.getByRole("button", { name: /refresh results/i });
      if ((await refreshButtons.count()) > 0) {
        await refreshButtons.first().click();
      }
      await loadedList.getByText("AGENTS.md", { exact: true }).waitFor({ state: "visible" });

      const codexText = (await loadedList.allTextContents()).join("\n");
      expect(codexText.trim().length).toBeGreaterThan(0);
      expect(codexText).not.toEqual(copilotText);
    }, "atlas-simulator");
  });

  maybe("scans a folder and updates insights when switching tools", { timeout: 45000 }, async () => {
    await withE2EPage(browser, { baseURL, viewport: { width: 1280, height: 900 } }, async (page) => {
      await page.addInitScript(() => {
        const makeFile = (name: string) => ({ kind: "file", name });
        const makeDir = (name: string, entries: Array<[string, { kind: string; name: string }]>) => ({
          kind: "directory",
          name,
          entries: async function* entriesGenerator() {
            for (const [entryName, handle] of entries) {
              yield [entryName, handle] as [string, { kind: string; name: string }];
            }
          },
        });

        const root = makeDir("mock-repo", [
          [
            ".github",
            makeDir(".github", [["copilot-instructions.md", makeFile("copilot-instructions.md")]]),
          ],
          ["AGENTS.md", makeFile("AGENTS.md")],
        ]);

        (window as unknown as { showDirectoryPicker?: () => Promise<unknown> }).showDirectoryPicker = async () => root;
      });

      await page.goto("/atlas/simulator", { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { name: /^scan a folder$/i }).first().waitFor({ state: "visible" });

      await page.getByRole("button", { name: /scan a folder/i }).first().click();

      const loadedList = page.getByRole("list", { name: /loaded files/i });
      await loadedList.getByText(".github/copilot-instructions.md", { exact: true }).waitFor({ state: "visible" });

      const missingList = page.getByRole("list", { name: /missing instruction files/i });
      await missingList.getByText("Scoped instructions", { exact: true }).waitFor({ state: "visible" });

      await page.getByText(/show advanced settings/i).click();
      await page.getByLabel("Tool", { exact: true }).selectOption("codex-cli");
      const refreshButtons = page.getByRole("button", { name: /refresh results/i });
      if ((await refreshButtons.count()) > 0) {
        await refreshButtons.first().click();
      }

      await loadedList.getByText("AGENTS.md", { exact: true }).waitFor({ state: "visible" });
      await missingList.getByText("Directory override (root)", { exact: true }).waitFor({ state: "visible" });
    }, "atlas-simulator-folder-scan");
  });
});
