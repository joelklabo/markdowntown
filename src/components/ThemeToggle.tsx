"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "./ui/Button";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      type="button"
      aria-pressed={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={toggle}
      className="gap-1 text-sm"
    >
      <span aria-hidden>{isDark ? "🌙" : "☀️"}</span>
      <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
    </Button>
  );
}
