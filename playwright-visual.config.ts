import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "__tests__/visual",
  timeout: 60_000,
  expect: {
    toMatchSnapshot: { threshold: 0.2 },
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } },
    },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
    },
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    headless: true,
  },
});
