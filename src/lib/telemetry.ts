export const UI_TELEMETRY_EVENT = "mdt_ui_telemetry";

export type UiTelemetryEventName = "scan_start" | "scan_complete" | "scan_results_cta";

export type UiTelemetryEventDetail = {
  name: UiTelemetryEventName;
  properties?: Record<string, unknown>;
};

export function emitUiTelemetryEvent(detail: UiTelemetryEventDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(UI_TELEMETRY_EVENT, { detail }));
}
