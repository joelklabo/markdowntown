import { chromium, Browser } from "playwright";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
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

      await page.getByTestId("workbench-scopes-panel").waitFor({ state: "visible" });
      const skillsPanel = page.getByTestId("workbench-skills-panel");
      await skillsPanel.waitFor({ state: "visible" });

      const addSkill = skillsPanel.getByRole("button", { name: /\\+ skill/i });
      if ((await addSkill.count()) > 0) {
        await addSkill.click();
      } else {
        await skillsPanel.getByRole("button", { name: /add a skill/i }).click();
      }
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

      const agentsCard = page.getByTestId("export-target-agents-md");
      await agentsCard.waitFor({ state: "visible" });
      await agentsCard.getByText("Skills export").waitFor({ state: "visible" });
      await agentsCard.getByLabel("All skills").click();

      const copilotCard = page.getByTestId("export-target-github-copilot");
      await copilotCard.waitFor({ state: "visible" });
      await copilotCard.getByLabel("All skills").click();

      const claudeCard = page.getByTestId("export-target-claude-code");
      await claudeCard.waitFor({ state: "visible" });
      await claudeCard.getByLabel("All skills").click();
      await page.getByRole("button", { name: /^compile$/i }).click();

      await page.getByText("Manifest").waitFor({ state: "visible" });
      await page.getByRole("button", { name: "src-ts.instructions.md" }).waitFor({ state: "visible" });

      await page.getByText(/\.claude\/skills\/.*SKILL\.md/).waitFor({ state: "visible" });

      const agentsFile = page
        .locator("div")
        .filter({ has: page.locator("pre") })
        .filter({ has: page.locator("div.font-mono", { hasText: /^AGENTS\\.md$/ }) })
        .first();
      const agentsPre = agentsFile.locator("pre").first();
      await agentsPre.waitFor({ state: "visible" });
      const agentsText = (await agentsPre.textContent()) ?? "";
      expect(agentsText).toContain("## Skills");
      expect(agentsText).toContain("### Export skill");

      const copilotFile = page
        .locator("div")
        .filter({ has: page.locator("pre") })
        .filter({ has: page.locator("div.font-mono", { hasText: /\.github\/copilot-instructions\.md$/ }) })
        .first();
      const copilotPre = copilotFile.locator("pre").first();
      await copilotPre.waitFor({ state: "visible" });
      const copilotText = (await copilotPre.textContent()) ?? "";
      expect(copilotText).toContain("## Skills");
      expect(copilotText).toContain("### Export skill");
    });
  }, 60000);
});
