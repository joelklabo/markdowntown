import { chromium, type Browser } from "playwright";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { withE2EPage } from "./playwrightArtifacts";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;

describe("Scan to workbench export flow", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("scans a folder, refreshes results, and exports in Workbench", { timeout: 70000 }, async () => {
    await withE2EPage(
      browser,
      { baseURL, viewport: { width: 1280, height: 900 } },
      async (page) => {
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

        const refreshButtons = page.getByRole("button", { name: /refresh results/i });
        if ((await refreshButtons.count()) > 0) {
          await refreshButtons.first().click();
        }

        await loadedList.getByText("AGENTS.md", { exact: true }).waitFor({ state: "visible" });

        await page.getByRole("link", { name: /open workbench/i }).click();
        await page.waitForURL(/\/workbench/);

        await page.getByText(/scan defaults applied/i).waitFor({ state: "visible" });
        await page.getByText(/GitHub Copilot · cwd \(repo root\)/i).waitFor({ state: "visible" });

        await page.getByTestId("workbench-scopes-panel").waitFor({ state: "visible" });

        await page.getByRole("button", { name: /add scope/i }).click();
        await page.getByLabel("Scope glob pattern").fill("src/**/*.ts");
        await page.getByRole("button", { name: /^add$/i }).click();

        await page.getByText("src/**/*.ts").waitFor({ state: "visible" });

        await page.getByRole("button", { name: /^\+ add$/i }).click();
        await page.getByLabel("Block title").fill("Scan Export Block");
        await page.getByPlaceholder(/write markdown instructions/i).fill("Export from scan flow");
        await page.getByLabel("GitHub Copilot").click();

        await page.getByRole("button", { name: /^compile$/i }).click();
        await page.getByText("Manifest").waitFor({ state: "visible" });
        await page.getByRole("button", { name: "src-ts.instructions.md" }).waitFor({ state: "visible" });
      },
      "scan-to-export"
    );
  });

  maybe("keeps scan results consistent after refresh", { timeout: 60000 }, async () => {
    await withE2EPage(
      browser,
      { baseURL, viewport: { width: 1280, height: 900 } },
      async (page) => {
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

          const root = makeDir("mock-repo", [["AGENTS.md", makeFile("AGENTS.md")]]);

          (window as unknown as { showDirectoryPicker?: () => Promise<unknown> }).showDirectoryPicker = async () => root;
        });

        await page.goto("/atlas/simulator", { waitUntil: "domcontentloaded" });
        await page.getByRole("button", { name: /scan a folder/i }).first().click();

        const loadedList = page.getByRole("list", { name: /loaded files/i });
        await loadedList.getByText("AGENTS.md", { exact: true }).waitFor({ state: "visible" });

        const refreshButtons = page.getByRole("button", { name: /refresh results/i });
        if ((await refreshButtons.count()) > 0) {
          await refreshButtons.first().click();
        }

        const text = (await loadedList.allTextContents()).join("\n");
        expect(text).toContain("AGENTS.md");
      },
      "scan-refresh"
    );
  });
});
