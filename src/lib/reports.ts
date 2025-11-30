import fs from "node:fs";
import path from "node:path";

export type AbuseSignal = {
  ip?: string | null;
  userId?: string | null;
  reason: string;
  at?: Date;
};

const REPORTS_DIR = path.join(process.cwd(), "logs");
const REPORTS_FILE = path.join(REPORTS_DIR, "abuse-signals.log");

function ensureFile() {
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  if (!fs.existsSync(REPORTS_FILE)) fs.writeFileSync(REPORTS_FILE, "");
}

export function logAbuseSignal(signal: AbuseSignal) {
  try {
    ensureFile();
    const entry = {
      ...signal,
      at: signal.at ?? new Date().toISOString(),
    };
    fs.appendFileSync(REPORTS_FILE, JSON.stringify(entry) + "\n", { encoding: "utf8" });
  } catch (err) {
    console.error("Failed to log abuse signal", err);
  }
}
