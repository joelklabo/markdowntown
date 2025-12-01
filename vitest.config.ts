import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    // @ts-expect-error upstream typing lag; supported in Vitest runtime
    environmentMatchGlobs: [
      ["**/__tests__/api/**", "node"],
      ["**/__tests__/e2e/**", "node"],
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage",
      thresholds: {
        lines: 80,
        statements: 80,
        branches: 65,
        functions: 60,
      },
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "**/next.config.*",
        "**/postcss.config.*",
        "**/tailwind.config.*",
        "**/eslint.config.*",
        "**/src/app/**",
        "**/src/providers/**",
        "src/**/*config.ts",
        "src/lib/agents/sample.ts",
        "src/types/**",
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
