import { chromium, Browser } from "playwright";
import { describe, it, beforeAll, afterAll } from "vitest";
import { withE2EPage } from "./playwrightArtifacts";

const baseURL = process.env.E2E_BASE_URL;
const headless = true;

describe("Workbench export flow", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless });
  });

  afterAll(async () => {
    await browser?.close();
  });

  const maybe = baseURL ? it : it.skip;

  maybe("export produces expected filenames", async () => {
    await withE2EPage(browser, { baseURL }, async (page) => {
      await page.goto("/workbench", { waitUntil: "domcontentloaded" });

      await page.getByText("Scopes").waitFor({ state: "visible" });

      await page.getByRole("button", { name: /\\+ skill/i }).click();
      await page.locator("#skill-title").fill("Export skill");
      await page.locator("#skill-description").fill("Skill used in export tests.");

      await page.getByRole("button", { name: /add scope/i }).click();
      await page.getByLabel("Scope glob pattern").fill("src/**/*.ts");
      await page.getByRole("button", { name: /^add$/i }).click();

      await page.getByText("src/**/*.ts").waitFor({ state: "visible" });

      await page.getByRole("button", { name: /^\+ add$/i }).click();

      await page.getByLabel("Block title").fill("My Block");
      await page.getByPlaceholder(/write markdown instructions/i).fill("Hello from scope");

      await page.getByLabel("GitHub Copilot").click();
      await page.getByLabel("AGENTS.md").click();
      await page.getByLabel("Claude Code").click();

      await page.getByRole("button", { name: /advanced/i }).click();
      await page.getByText("Skills export").waitFor({ state: "visible" });

      const agentsCard = page
        .locator("div")
        .filter({ hasText: "agents-md" })
        .filter({ hasText: "Skills export" })
        .first();
      await agentsCard.getByLabel("All skills").click();

      const copilotCard = page
        .locator("div")
        .filter({ hasText: "github-copilot" })
        .filter({ hasText: "Skills export" })
        .first();
      await copilotCard.getByLabel("All skills").click();

      const claudeCard = page
        .locator("div")
        .filter({ hasText: "claude-code" })
        .filter({ hasText: "Skills export" })
        .first();
      await claudeCard.getByLabel("All skills").click();
      await page.getByRole("button", { name: /^compile$/i }).click();

      await page.getByText("Manifest").waitFor({ state: "visible" });
      await page.getByRole("button", { name: "src-ts.instructions.md" }).waitFor({ state: "visible" });

      await page.getByText(/\.claude\/skills\/.*SKILL\.md/).waitFor({ state: "visible" });

      const agentsFile = page
        .locator("div")
        .filter({ hasText: "AGENTS.md" })
        .filter({ has: page.locator("pre") })
        .first();
      await agentsFile.getByText("## Skills").waitFor({ state: "visible" });
      await agentsFile.getByText("### Export skill").waitFor({ state: "visible" });

      const copilotFile = page
        .locator("div")
        .filter({ hasText: ".github/copilot-instructions.md" })
        .filter({ has: page.locator("pre") })
        .first();
      await copilotFile.getByText("## Skills").waitFor({ state: "visible" });
      await copilotFile.getByText("### Export skill").waitFor({ state: "visible" });
    });
  }, 60000);
});
