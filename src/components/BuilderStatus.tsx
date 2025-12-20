"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type PerfSample = {
  nav: number | null;
  cache: string | null;
};

type SaveState = "idle" | "dirty" | "saving" | "saved";

export function BuilderStatus({ saveState = "idle" }: { saveState?: SaveState }) {
  const isVisualTest =
    typeof window !== "undefined" && (window as { __MDT_VISUAL_TEST__?: boolean }).__MDT_VISUAL_TEST__ === true;
  const [perf, setPerf] = useState<PerfSample>(() =>
    isVisualTest ? { nav: 120, cache: "hit" } : { nav: null, cache: null }
  );
  const [bundleOk, setBundleOk] = useState(() => true);

  useEffect(() => {
    if (isVisualTest) return;
    try {
      const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      const cache = navEntry?.serverTiming?.find((t) => t.name === "cache")?.description ?? null;
      requestAnimationFrame(() => setPerf({ nav: navEntry ? Math.round(navEntry.responseStart) : null, cache }));
    } catch {
      /* ignore */
    }
    requestAnimationFrame(() => {
      setBundleOk((window as { __MDT_BUNDLE_OK?: boolean }).__MDT_BUNDLE_OK !== false);
    });
  }, [isVisualTest]);

  const saveLabel = (() => {
    if (saveState === "saving") return "Saving…";
    if (saveState === "dirty") return "Unsaved changes";
    if (saveState === "saved") return "Saved";
    return "Idle";
  })();
  const saveTone =
    saveState === "dirty"
      ? "text-[color:var(--mdt-color-warning)]"
      : saveState === "saving"
        ? "text-[color:var(--mdt-color-info)]"
        : "text-mdt-text";

  return (
    <div className="sticky bottom-0 z-20 mt-6 flex flex-col gap-mdt-2 rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-4 py-mdt-3 text-caption text-mdt-muted sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-mdt-3">
        <Dot ok={bundleOk} />
        <span>{bundleOk ? "Bundle within budget" : "Bundle size warning"}</span>
        <Divider />
        <Dot ok={perf.nav !== null} />
        <span>TTFB {perf.nav ? `${perf.nav}ms` : "—"}</span>
        <Divider />
        <span className="flex items-center gap-1">
          <Dot ok={perf.cache !== "bypass"} />
          Cache {perf.cache ?? "n/a"}
        </span>
        <Divider />
        <span className={cn("flex items-center gap-1 font-medium", saveTone)}>
          <Dot ok={saveState !== "dirty"} />
          {saveLabel}
        </span>
      </div>
      <span className="text-caption text-mdt-muted">live perf · cache intent · save state</span>
    </div>
  );
}

function Dot({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-2.5 w-2.5 rounded-full",
        ok ? "bg-[color:var(--mdt-color-success)]" : "bg-[color:var(--mdt-color-warning)]"
      )}
    />
  );
}

function Divider() {
  return <span className="hidden h-4 w-px bg-mdt-border sm:inline-block" aria-hidden />;
}
