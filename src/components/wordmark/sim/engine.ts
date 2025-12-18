export type CityWordmarkEngineListener = () => void;

const listeners = new Set<CityWordmarkEngineListener>();

let timer: ReturnType<typeof setInterval> | null = null;
let nowMs = 0;

const TICK_MS = 600;

function emit() {
  for (const listener of listeners) listener();
}

function ensureRunning() {
  if (timer) return;
  nowMs = Date.now();
  timer = setInterval(() => {
    nowMs = Date.now();
    emit();
  }, TICK_MS);
}

function maybeStop() {
  if (listeners.size !== 0) return;
  if (!timer) return;
  clearInterval(timer);
  timer = null;
}

export function subscribeCityWordmarkEngine(listener: CityWordmarkEngineListener): () => void {
  listeners.add(listener);
  ensureRunning();
  return () => {
    listeners.delete(listener);
    maybeStop();
  };
}

export function getCityWordmarkEngineNowMs(): number {
  return nowMs;
}

