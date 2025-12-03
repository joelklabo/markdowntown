import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Tokens | MarkdownTown",
  description: "Preview MarkdownTown light/dark tokens for colors, spacing, typography, and motion.",
};

const colorVars = [
  "primary",
  "primary-strong",
  "primary-soft",
  "accent",
  "accent-soft",
  "success",
  "warning",
  "danger",
  "info",
  "surface",
  "surface-subtle",
  "surface-strong",
  "surface-raised",
  "overlay",
  "border",
  "border-strong",
  "ring",
  "text",
  "text-muted",
  "text-subtle",
  "text-on-strong",
];

const dataVars = ["data-1", "data-2", "data-3", "data-4", "data-5", "data-6", "data-7", "data-8"];

export default function TokensPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-10">
      <header className="space-y-2">
        <p className="text-caption text-mdt-muted uppercase tracking-wide">Design System</p>
        <h1 className="text-display">Tokens preview</h1>
        <p className="text-body text-mdt-muted">
          Live view of semantic tokens for light/dark themes. Toggle your system theme to compare.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-h2">Colors</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {colorVars.map((name) => (
            <TokenSwatch key={name} label={name} varName={`--mdt-color-${name}`} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2">Data viz</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {dataVars.map((name) => (
            <TokenSwatch key={name} label={name} varName={`--mdt-${name}`} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-h2">Motion</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[
            ["fast", "var(--mdt-motion-fast)"],
            ["base", "var(--mdt-motion-base)"],
            ["slow", "var(--mdt-motion-slow)"],
            ["enter", "var(--mdt-motion-enter)"],
            ["exit", "var(--mdt-motion-exit)"],
            ["snappy", "var(--mdt-motion-ease-snappy)"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-mdt-border bg-mdt-surface px-4 py-3 text-sm shadow-mdt-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{label}</span>
                <span className="text-caption text-mdt-muted">{value}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-mdt-surface-strong">
                <div
                  className="h-2 w-1/2 rounded-full bg-mdt-primary"
                  style={{ animation: `pulse-${label} 1.8s infinite` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

type TokenProps = { label: string; varName: string };

function TokenSwatch({ label, varName }: TokenProps) {
  const style = { backgroundColor: `var(${varName})`, borderColor: "var(--mdt-color-border)" };
  return (
    <div className="rounded-lg border bg-mdt-surface p-3 shadow-mdt-sm">
      <div className="h-16 rounded-md border" style={style} />
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-caption text-mdt-muted">{varName}</span>
      </div>
    </div>
  );
}

const pulse = `
@keyframes pulse-fast { 0% { transform: translateX(-50%); opacity: .9 } 100% { transform: translateX(220%); opacity: 0 } }
@keyframes pulse-base { 0% { transform: translateX(-50%); opacity: .9 } 100% { transform: translateX(220%); opacity: 0 } }
@keyframes pulse-slow { 0% { transform: translateX(-50%); opacity: .9 } 100% { transform: translateX(220%); opacity: 0 } }
@keyframes pulse-enter { 0% { transform: translateX(-50%); opacity: .9 } 100% { transform: translateX(220%); opacity: 0 } }
@keyframes pulse-exit { 0% { transform: translateX(-50%); opacity: .9 } 100% { transform: translateX(220%); opacity: 0 } }
@keyframes pulse-snappy { 0% { transform: translateX(-50%); opacity: .9 } 100% { transform: translateX(220%); opacity: 0 } }
`;

if (typeof document !== "undefined" && !document.getElementById("token-animations")) {
  const style = document.createElement("style");
  style.id = "token-animations";
  style.innerHTML = pulse;
  document.head.appendChild(style);
}
