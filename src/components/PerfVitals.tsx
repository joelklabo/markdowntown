"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type MetricPayload = Record<string, unknown>;

declare global {
  interface Window {
    posthog?: { capture: (event: string, payload: MetricPayload) => void };
  }
}

const SAMPLE_RATE = 0.35;
const API_SAMPLE_RATE = 0.15;

function emit(event: string, data: MetricPayload) {
  if (typeof window === "undefined") return;
  const payload = { event, ...data };
  if (window.posthog?.capture) {
    window.posthog.capture(event, payload);
  } else {
    console.debug("[perf]", payload);
  }
}

function deviceContext(path: string) {
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  const connection = (nav as unknown as { connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean } })?.connection;
  return {
    path,
    ua: nav?.userAgent,
    locale: nav?.language,
    deviceMemory: (nav as unknown as { deviceMemory?: number }).deviceMemory,
    cores: nav?.hardwareConcurrency,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
    saveData: connection?.saveData,
  };
}

export function PerfVitals() {
  const pathname = usePathname();
  const navStart = useRef<number>(typeof performance !== "undefined" ? performance.now() : 0);

  useEffect(() => {
    navStart.current = typeof performance !== "undefined" ? performance.now() : 0;
    const shouldSample = Math.random() <= SAMPLE_RATE;
    if (!shouldSample || typeof window === "undefined" || typeof performance === "undefined") return;

    let cancelled = false;

    const context = deviceContext(pathname);

    const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (navEntry) {
      const cacheHint = navEntry.serverTiming?.find((t) => t.name === "cache")?.description ?? null;
      emit("perf_navigation", {
        ...context,
        ttfb: Math.round(navEntry.responseStart),
        domContentLoaded: Math.round(navEntry.domContentLoadedEventEnd),
        loadEvent: Math.round(navEntry.loadEventEnd),
        transferSize: navEntry.transferSize,
        encodedBodySize: navEntry.encodedBodySize,
        decodedBodySize: navEntry.decodedBodySize,
        cache: cacheHint,
      });
    }

    import("web-vitals").then(({ onFCP, onLCP, onCLS, onINP, onTTFB }) => {
      if (cancelled) return;
      onFCP((metric) => emit("web_vital_fcp", { ...context, value: Math.round(metric.value) }));
      onLCP((metric) => emit("web_vital_lcp", { ...context, value: Math.round(metric.value) }));
      onCLS((metric) => emit("web_vital_cls", { ...context, value: Number(metric.value.toFixed(4)) }));
      onINP((metric) => emit("web_vital_inp", { ...context, value: Math.round(metric.value) }));
      onTTFB((metric) => {
        const entry = metric?.entries?.[0] as PerformanceNavigationTiming | undefined;
        const cache = entry?.serverTiming?.find?.((t) => t.name === "cache")?.description ?? null;
        emit("web_vital_ttfb", { ...context, value: Math.round(metric.value), cache });
      });
    });

    // Approximate SPA nav timing (time to idle after route change)
    const idle = window.requestIdleCallback || ((cb: () => void) => window.setTimeout(cb, 0));
    const idleId = idle(() => {
      const duration = performance.now() - navStart.current;
      emit("spa_nav", { ...context, duration: Math.round(duration) });
    });

    // Sample API/fetch latency for current view
    let apiSamples = 0;
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (apiSamples >= 5) return;
        if (Math.random() > API_SAMPLE_RATE) return;
        if (entry.entryType !== "resource") return;
        const res = entry as PerformanceResourceTiming;
        if (res.initiatorType === "fetch" || res.initiatorType === "xmlhttprequest") {
          apiSamples += 1;
          const cacheHint = res.serverTiming?.find?.((t) => t.name === "cache")?.description ?? null;
          emit("perf_api", {
            ...context,
            name: res.name,
            duration: Math.round(res.duration),
            ttfb: Math.round(res.responseStart - res.startTime),
            transferSize: res.transferSize,
            cache: cacheHint,
          });
        }
      });
    });

    try {
      resourceObserver.observe({ type: "resource", buffered: true });
    } catch {
      // ignore
    }

    // Flush CLS when tab closes if web-vitals didn't already
    const onHide = () => emit("web_vital_cls_flush", { ...context, visibility: document.visibilityState });
    document.addEventListener("visibilitychange", onHide);

    return () => {
      cancelled = true;
      resourceObserver.disconnect();
      document.removeEventListener("visibilitychange", onHide);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idleId);
      else clearTimeout(idleId as number);
    };
  }, [pathname]);

  return null;
}
