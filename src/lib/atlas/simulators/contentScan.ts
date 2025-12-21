export type ContentScanOptions = {
  allowlist?: RegExp[];
  maxBytes?: number;
};

export type ContentReadReason = "not-allowlisted" | "too-large" | "unreadable";

export type ContentReadResult = {
  content: string | null;
  truncated: boolean;
  skipped: boolean;
  reason?: ContentReadReason;
};

type ReadableFile = {
  size?: number;
  text: () => Promise<string>;
};

export const DEFAULT_MAX_CONTENT_BYTES = 64 * 1024;

export const DEFAULT_INSTRUCTION_ALLOWLIST: RegExp[] = [
  /^AGENTS\.md$/,
  /^AGENTS\.override\.md$/,
  /\/AGENTS\.md$/,
  /\/AGENTS\.override\.md$/,
  /^CLAUDE\.md$/,
  /\/CLAUDE\.md$/,
  /^GEMINI\.md$/,
  /\/GEMINI\.md$/,
  /^\.github\/copilot-instructions\.md$/,
  /^\.github\/copilot-instructions\/.+\.instructions\.md$/,
  /^\.github\/instructions\/.+\.instructions\.md$/,
  /^\.github\/agents\/.+/,
];

function normalizePath(value: string): string {
  const normalized = value.replace(/\\/g, "/").replace(/^\.\/+/, "").replace(/\/+$/, "");
  if (!normalized || normalized === ".") return "";
  return normalized;
}

export function isAllowlistedInstructionPath(path: string, allowlist: RegExp[] = DEFAULT_INSTRUCTION_ALLOWLIST): boolean {
  const normalized = normalizePath(path);
  if (!normalized) return false;
  return allowlist.some((pattern) => pattern.test(normalized));
}

export async function readInstructionContent(
  path: string,
  readFile: () => Promise<ReadableFile>,
  options: ContentScanOptions = {},
): Promise<ContentReadResult> {
  const allowlist = options.allowlist ?? DEFAULT_INSTRUCTION_ALLOWLIST;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_CONTENT_BYTES;

  if (!isAllowlistedInstructionPath(path, allowlist)) {
    return { content: null, truncated: false, skipped: true, reason: "not-allowlisted" };
  }

  try {
    const file = await readFile();
    if (typeof file.size === "number" && file.size > maxBytes) {
      return { content: null, truncated: false, skipped: true, reason: "too-large" };
    }
    const text = await file.text();
    if (text.length > maxBytes) {
      return { content: text.slice(0, maxBytes), truncated: true, skipped: false };
    }
    return { content: text, truncated: false, skipped: false };
  } catch {
    return { content: null, truncated: false, skipped: true, reason: "unreadable" };
  }
}
