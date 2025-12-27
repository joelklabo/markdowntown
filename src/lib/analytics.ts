/**
 * Lightweight PostHog wrapper used in client components.
 * Safe to call in SSR/ISR contexts; no-ops when posthog is unavailable.
 */
const REDACT_KEYS = new Set([
  "content",
  "contents",
  "cwd",
  "paths",
  "filepaths",
  "filepath",
  "filelist",
  "files",
  "rootname",
  "templatepath",
  "expectedpath",
  "instructionpath",
  "scanpath",
  "tree",
  "repotree",
  "repopaths",
  "sourcepaths",
  "scannedpaths",
  "scannedtree",
]);

type AnalyticsRecord = Record<string, unknown>;

export function redactAnalyticsPayload(properties?: AnalyticsRecord): AnalyticsRecord | undefined {
  if (!properties) return properties;
  return redactObject(properties);
}

function redactObject(input: AnalyticsRecord): AnalyticsRecord {
  const output: AnalyticsRecord = {};
  for (const [key, value] of Object.entries(input)) {
    if (shouldRedactKey(key)) continue;
    const nextValue = redactValue(value);
    if (nextValue !== undefined) output[key] = nextValue;
  }
  return output;
}

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => {
      if (isRecord(entry)) return redactObject(entry);
      return entry;
    });
  }
  if (isRecord(value)) {
    return redactObject(value);
  }
  return value;
}

function shouldRedactKey(key: string) {
  return REDACT_KEYS.has(key.toLowerCase());
}

function isRecord(value: unknown): value is AnalyticsRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const ph = (window as unknown as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } }).posthog;
    ph?.capture?.(event, redactAnalyticsPayload(properties));
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

export function trackSkillsListView(properties: {
  count: number;
  q?: string;
  tags?: string[];
  targets?: string[];
  sort?: string;
}) {
  trackUiEvent("skills_list_view", properties);
}

export function trackSkillDetailView(properties: {
  id: string;
  slug?: string;
  title?: string;
  targets?: string[];
  capabilityCount?: number;
}) {
  trackUiEvent("skills_detail_view", properties);
}

export function trackSkillOpenWorkbench(properties: {
  id: string;
  slug?: string;
  title?: string;
  source: string;
}) {
  trackUiEvent("skills_open_workbench", properties);
}

export function trackSkillExportConfig(properties: {
  targetId: string;
  mode: string;
  allowListCount: number;
  totalSkills: number;
}) {
  trackUiEvent("skills_export_config", properties);
}

export function trackSkillExportAction(properties: {
  action: "download" | "copy";
  targetIds?: string[];
  targetId?: string;
  path?: string;
  skillCount: number;
}) {
  trackUiEvent("skills_export_action", properties);
}

export function trackSkillWorkbenchEdit(properties: {
  action: "add" | "remove" | "select" | "update";
  id?: string;
  field?: string;
}) {
  trackUiEvent("skills_workbench_edit", properties);
}
