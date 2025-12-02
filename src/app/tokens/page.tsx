import type { Metadata } from "next";

const colors = [
  { name: "Primary", varName: "--mdt-color-primary" },
  { name: "Primary Strong", varName: "--mdt-color-primary-strong" },
  { name: "Accent", varName: "--mdt-color-accent" },
  { name: "Success", varName: "--mdt-color-success" },
  { name: "Warning", varName: "--mdt-color-warning" },
  { name: "Danger", varName: "--mdt-color-danger" },
  { name: "Info", varName: "--mdt-color-info" },
  { name: "Surface", varName: "--mdt-color-surface" },
  { name: "Surface Subtle", varName: "--mdt-color-surface-subtle" },
  { name: "Surface Strong", varName: "--mdt-color-surface-strong" },
  { name: "Border", varName: "--mdt-color-border" },
  { name: "Text", varName: "--mdt-color-text" },
  { name: "Muted", varName: "--mdt-color-text-muted" },
];

const shadows = [
  { name: "Shadow SM", varName: "--mdt-shadow-sm" },
  { name: "Shadow MD", varName: "--mdt-shadow-md" },
  { name: "Shadow Glow", varName: "--mdt-shadow-glow" },
];

const radii = [
  { name: "Radius sm", token: "var(--radius-sm, 6px)" },
  { name: "Radius md", token: "var(--radius-md, 10px)" },
  { name: "Radius lg", token: "var(--radius-lg, 16px)" },
  { name: "Radius pill", token: "var(--radius-pill, 999px)" },
];

export const metadata: Metadata = {
  title: "Design tokens · MarkdownTown",
  description: "Audit view for Option A design tokens (colors, shadows, radii, typography).",
};

function ColorSwatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="rounded-mdt-md border border-mdt-border bg-mdt-surface p-3 shadow-mdt-sm flex items-center gap-3">
      <div
        className="h-10 w-14 rounded-mdt-md border border-mdt-border"
        style={{ backgroundColor: `var(${varName})` }}
      />
      <div className="text-body">
        <div className="font-semibold text-mdt-text">{name}</div>
        <div className="text-caption text-mdt-muted">{varName}</div>
      </div>
    </div>
  );
}

function ShadowSwatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="rounded-mdt-md border border-mdt-border bg-mdt-surface p-4 shadow-mdt-sm">
      <div
        className="h-12 w-full rounded-mdt-md bg-mdt-surface-subtle"
        style={{ boxShadow: `var(${varName})` }}
      />
      <div className="mt-3 font-semibold text-mdt-text">{name}</div>
      <div className="text-caption text-mdt-muted">{varName}</div>
    </div>
  );
}

function RadiusSwatch({ name, token }: { name: string; token: string }) {
  return (
    <div className="rounded-mdt-md border border-mdt-border bg-mdt-surface p-4 shadow-mdt-sm">
      <div className="h-12 w-full bg-mdt-surface-subtle border border-mdt-border" style={{ borderRadius: token }} />
      <div className="mt-3 font-semibold text-mdt-text">{name}</div>
      <div className="text-caption text-mdt-muted">{token}</div>
    </div>
  );
}

export default function TokensPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      <header className="space-y-2">
        <p className="text-caption text-mdt-muted">Design System</p>
        <h1 className="text-h1 font-display text-mdt-text">Option A · Focus / Flow tokens</h1>
        <p className="text-body text-mdt-muted max-w-3xl">
          Single source of truth for color, shadow, radius, and motion tokens. Values are sourced from CSS custom
          properties so updates cascade across Tailwind and components.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-h2 font-display text-mdt-text">Colors</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {colors.map((c) => (
            <ColorSwatch key={c.varName} name={c.name} varName={c.varName} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 font-display text-mdt-text">Shadows</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {shadows.map((s) => (
            <ShadowSwatch key={s.varName} name={s.name} varName={s.varName} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 font-display text-mdt-text">Radii</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {radii.map((r) => (
            <RadiusSwatch key={r.name} name={r.name} token={r.token} />
          ))}
        </div>
      </section>
    </div>
  );
}
