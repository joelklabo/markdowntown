import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    environmentMatchGlobs: [
      ["**/__tests__/api/**", "node"],
      ["**/__tests__/e2e/**", "node"],
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage",
      lines: 14,
      statements: 14,
      branches: 5,
      functions: 20,
    },
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    clearMocks: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
