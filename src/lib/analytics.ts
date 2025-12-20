/**
 * Lightweight PostHog wrapper used in client components.
 * Safe to call in SSR/ISR contexts; no-ops when posthog is unavailable.
 */
export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const ph = (window as unknown as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } }).posthog;
    ph?.capture?.(event, properties);
  } catch {
    // swallow analytics errors to avoid UI impact
  }
}

function withPageContext(properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return properties;
  return {
    path: window.location.pathname,
    referrer: document.referrer || undefined,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    ...properties,
  };
}

export function trackUiEvent(event: string, properties?: Record<string, unknown>) {
  track(event, withPageContext(properties));
}

export function trackWebVital(metric: string, value: number, properties?: Record<string, unknown>) {
  track(`web_vital_${metric}`, withPageContext({ value, ...properties }));
}

export function trackError(event: string, error: Error, properties?: Record<string, unknown>) {
  track(event, {
    message: error.message,
    stack: error.stack,
    ...properties,
  });
}
