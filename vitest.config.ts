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
      lines: 55,
      statements: 55,
      branches: 40,
      functions: 45,
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "**/next.config.*",
        "**/postcss.config.*",
        "**/tailwind.config.*",
        "**/eslint.config.*",
        "**/src/app/**",
        "**/src/providers/**",
        ".next/**",
        "coverage/**",
      ],
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
