/**
 * Lightweight PostHog wrapper used in client components.
 * Safe to call in SSR/ISR contexts; no-ops when posthog is unavailable.
 */
export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const ph = (window as unknown as { posthog?: { capture: typeof import("posthog-js").capture } }).posthog;
    ph?.capture?.(event, properties);
  } catch {
    // swallow analytics errors to avoid UI impact
  }
}
