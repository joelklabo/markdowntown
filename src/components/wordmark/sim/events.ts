import type { CityWordmarkEvent } from "./types";

export const CITY_WORDMARK_EVENT = "mdt:city-wordmark:event";

export type CityWordmarkEventListener = (event: CityWordmarkEvent) => void;

export function dispatchCityWordmarkEvent(event: CityWordmarkEvent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<CityWordmarkEvent>(CITY_WORDMARK_EVENT, { detail: event }));
}

export function listenCityWordmarkEvents(listener: CityWordmarkEventListener) {
  if (typeof window === "undefined") return () => {};

  function onEvent(e: Event) {
    if (!(e instanceof CustomEvent)) return;
    const detail = e.detail as CityWordmarkEvent | undefined;
    if (!detail) return;
    listener(detail);
  }

  window.addEventListener(CITY_WORDMARK_EVENT, onEvent);
  return () => window.removeEventListener(CITY_WORDMARK_EVENT, onEvent);
}

