"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackUiEvent } from "@/lib/analytics";
import { COMMAND_PALETTE_OPEN_EVENT } from "./CommandPalette";

export function UxTelemetry() {
  const pathname = usePathname();
  const shellTracked = useRef(false);
  const lastTheme = useRef<string | null>(null);
  const lastDensity = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    trackUiEvent("ui_route_view", { route: pathname });
    if (!shellTracked.current) {
      trackUiEvent("ui_shell_loaded", { route: pathname });
      shellTracked.current = true;
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    lastTheme.current = root.dataset.theme ?? null;
    lastDensity.current = root.dataset.density ?? null;

    const observer = new MutationObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.type !== "attributes" || !(entry.target instanceof HTMLElement)) return;
        if (entry.attributeName === "data-theme") {
          const nextTheme = entry.target.dataset.theme ?? null;
          if (nextTheme && nextTheme !== lastTheme.current) {
            trackUiEvent("ui_theme_change", { theme: nextTheme, previous: lastTheme.current ?? undefined });
            lastTheme.current = nextTheme;
          }
        }
        if (entry.attributeName === "data-density") {
          const nextDensity = entry.target.dataset.density ?? null;
          if (nextDensity && nextDensity !== lastDensity.current) {
            trackUiEvent("ui_density_change", { density: nextDensity, previous: lastDensity.current ?? undefined });
            lastDensity.current = nextDensity;
          }
        }
      });
    });

    observer.observe(root, { attributes: true, attributeFilter: ["data-theme", "data-density"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleCommandPalette(event: Event) {
      const detail = (event as CustomEvent<{ origin?: string }>).detail;
      trackUiEvent("ui_command_palette_open", { origin: detail?.origin ?? "entry_point" });
    }
    if (typeof window === "undefined") return;
    window.addEventListener(COMMAND_PALETTE_OPEN_EVENT, handleCommandPalette as EventListener);
    return () =>
      window.removeEventListener(COMMAND_PALETTE_OPEN_EVENT, handleCommandPalette as EventListener);
  }, []);

  return null;
}
