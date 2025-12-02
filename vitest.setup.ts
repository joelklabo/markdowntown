/// <reference types="vitest" />
import "@testing-library/jest-dom";

// Radix Tooltip and Drawer use ResizeObserver; jsdom doesn't provide it by default.
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const globalWithRO = globalThis as typeof globalThis & { ResizeObserver?: typeof ResizeObserver };
globalWithRO.ResizeObserver = ResizeObserver;
