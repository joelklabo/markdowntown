"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type MetricPayload = Record<string, unknown>;

function emit(event: string, data: MetricPayload) {
  if (typeof window === "undefined") return;
  const payload = { event, ...data };
  if (window.posthog && typeof window.posthog.capture === "function") {
    window.posthog.capture(event, payload);
  } else {
    // Best-effort fallback: log to console to avoid silent failures
    console.debug("[perf]", payload);
  }
}

export function PerfVitals() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof performance === "undefined") return;

    // Navigation timing baseline
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav) {
      emit("perf_navigation", {
        path: pathname,
        ttfb: nav.responseStart,
        domContentLoaded: nav.domContentLoadedEventEnd,
        loadEvent: nav.loadEventEnd,
        transferSize: nav.transferSize,
        encodedBodySize: nav.encodedBodySize,
        decodedBodySize: nav.decodedBodySize,
      });
    }

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const last = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
      const lcp = (last.renderTime || last.loadTime || last.startTime) ?? 0;
      emit("web_vital_lcp", { path: pathname, value: Math.round(lcp) });
    });
    try {
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      // ignore
    }

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const shift = entry as LayoutShift;
        if (!shift.hadRecentInput) clsValue += shift.value;
      }
    });
    try {
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch {
      // ignore
    }
    const flushCls = () => emit("web_vital_cls", { path: pathname, value: Number(clsValue.toFixed(4)) });
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushCls();
    });

    return () => {
      lcpObserver.disconnect();
      clsObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
