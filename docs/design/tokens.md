# Option A · Focus / Flow design tokens

Single source of truth for the refreshed UI. Tokens live as CSS custom properties in `src/app/globals.css` and are mapped into Tailwind via `tailwind.config.ts`.

## Palette
- `--mdt-color-primary` / `--mdt-color-primary-strong`: electric cyan highlight
- `--mdt-color-accent`: soft mint accent
- `--mdt-color-bg`, `--mdt-color-surface`, `--mdt-color-surface-subtle`, `--mdt-color-surface-strong`
- `--mdt-color-border`, `--mdt-color-text`, `--mdt-color-text-muted`
- Semantic support: `--mdt-color-success`, `--mdt-color-warning`, `--mdt-color-danger`, `--mdt-color-info`

Dark palette is the default; `.dark` applies it, while the root (no class) holds the light variant.

## Typography
- Display: `var(--font-display)` (Space Grotesk)
- Body: `var(--font-inter)` (Inter)
- Mono: `var(--font-mono)` (JetBrains Mono)

## Radius & shadow
- Radius tokens: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`
- Shadows: `--mdt-shadow-sm`, `--mdt-shadow-md`, `--mdt-shadow-glow`

## Preview
A quick audit view lives at `/tokens`, showing colors, shadows, and radii pulled directly from CSS variables.
