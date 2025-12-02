"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type PerfSample = {
  nav: number | null;
  cache: string | null;
};

export function BuilderStatus() {
  const [perf, setPerf] = useState<PerfSample>({ nav: null, cache: null });
  const [bundleOk, setBundleOk] = useState(true);

  useEffect(() => {
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
  }, []);

  return (
    <div className="sticky bottom-0 z-20 mt-6 flex items-center justify-between rounded-mdt-md border border-mdt-border bg-mdt-surface px-4 py-2 text-sm text-mdt-muted shadow-mdt-sm">
      <div className="flex items-center gap-3">
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
      </div>
      <span className="text-caption text-mdt-muted">live perf · cache intent · bundle</span>
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
  return <span className="h-4 w-px bg-mdt-border" aria-hidden />;
}
