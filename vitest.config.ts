import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    environmentMatchGlobs: [
      ["**/__tests__/api/**", "node"],
      ["**/__tests__/e2e/**", "node"],
    ],
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    clearMocks: true,
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
