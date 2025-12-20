import type { CityWordmarkEvent } from "./types";
import { parseCityWordmarkEvent } from "./types";

export const CITY_WORDMARK_EVENT = "mdt:city-wordmark:event";

export type CityWordmarkEventListener = (event: CityWordmarkEvent) => void;

const EVENT_RATE_WINDOW_MS = 1000;
const EVENT_RATE_MAX = 12;
let rateWindowStart = 0;
let rateCount = 0;

function normalizeEventTs(ts?: number): number {
  const value = typeof ts === "number" && Number.isFinite(ts) ? ts : Date.now();
  return value;
}

function isRateLimited(ts: number): boolean {
  if (rateWindowStart === 0 || ts - rateWindowStart > EVENT_RATE_WINDOW_MS) {
    rateWindowStart = ts;
    rateCount = 0;
  }
  rateCount += 1;
  return rateCount > EVENT_RATE_MAX;
}

export function dispatchCityWordmarkEvent(event: CityWordmarkEvent) {
  if (typeof window === "undefined") return;
  const parsed = parseCityWordmarkEvent(event);
  if (!parsed) return;
  const ts = normalizeEventTs(parsed.ts);
  window.dispatchEvent(new CustomEvent<CityWordmarkEvent>(CITY_WORDMARK_EVENT, { detail: { ...parsed, ts } }));
}

export function listenCityWordmarkEvents(listener: CityWordmarkEventListener) {
  if (typeof window === "undefined") return () => {};

  function onEvent(e: Event) {
    if (!(e instanceof CustomEvent)) return;
    const detail = parseCityWordmarkEvent(e.detail);
    if (!detail) return;
    const ts = normalizeEventTs(detail.ts);
    if (isRateLimited(ts)) return;
    listener({ ...detail, ts });
  }

  window.addEventListener(CITY_WORDMARK_EVENT, onEvent);
  return () => window.removeEventListener(CITY_WORDMARK_EVENT, onEvent);
}
