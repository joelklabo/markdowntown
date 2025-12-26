"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "./ui/Button";
import { useSyncExternalStore } from "react";

const subscribe = (onStoreChange: () => void) => {
  if (typeof window !== "undefined") {
    if (typeof queueMicrotask === "function") {
      queueMicrotask(onStoreChange);
    } else {
      setTimeout(onStoreChange, 0);
    }
  }
  return () => {};
};

const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isDark = mounted ? theme === "dark" : false;

  return (
    <Button
      variant="ghost"
      size="xs"
      type="button"
      aria-pressed={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={toggle}
      className="gap-mdt-1"
    >
      <span aria-hidden>{isDark ? "🌙" : "☀️"}</span>
      <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
    </Button>
  );
}
