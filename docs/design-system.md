# MarkdownTown Design System

_Last updated: Dec 1, 2025_

## Principles
- **Semantic first:** use intent-based tokens (e.g., `mdt-surface`, `mdt-text-muted`, `mdt-primary`) instead of hard-coded hex values. Enables theming and accessibility tweaks without refactoring components.
- **Light & dark parity:** all semantic tokens have light/dark values via CSS variables; no color is hard-coded in components.
- **Consistent rhythm:** spacing and typography follow a 4px-derived scale; radii and shadows ladder consistently.
- **Composable primitives:** buttons, cards, pills use the semantic tokens and can be mixed without bespoke styling.

## Tokens

### Colors (semantic)
Defined as CSS variables in `src/app/globals.css`, exposed in Tailwind as `mdt-*`.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `mdt-primary` | `#0057D9` | `#7FB1FF` | Brand accents, primary actions |
| `mdt-primary-strong` | `#0047B3` | `#A9C8FF` | Hover/pressed states |
| `mdt-accent` | `#FFCC00` | `#FFD666` | Highlights, badges |
| `mdt-success` | `#16A34A` | `#4ADE80` | Success |
| `mdt-warning` | `#F59E0B` | `#FCD34D` | Warnings |
| `mdt-danger` | `#EF4444` | `#F87171` | Errors/destructive |
| `mdt-info` | `#2563EB` | `#60A5FA` | Informational |
| `mdt-surface` | `#FFFFFF` | `#0F172A` | Cards, panels |
| `mdt-surface-subtle` | `#F9FAFB` | `#111827` | Soft backgrounds |
| `mdt-border` | `#E5E7EB` | `#1F2A3D` | Dividers, outlines |
| `mdt-text` | `#0F172A` | `#E5E7EB` | Primary text |
| `mdt-text-muted` | `#6B7280` | `#9CA3AF` | Secondary text |

Legacy aliases remain (`mdt-blue`, `mdt-bg`, etc.) and map to the semantic tokens.

### Typography
- Font: Inter (variable) as `font-sans`.
- Scale (Tailwind keys): `display` 36px, `h1` 30px, `h2` 24px, `h3` 20px, `body` 16px, `body-sm` 14px, `caption` 12px.

### Spacing & Radius
- Spacing: default Tailwind 4px base; prefer multiples of 4. Common steps: 4, 8, 12, 16, 24, 32.
- Radius: `mdt-sm` 6px, `mdt-md` 10px, `mdt-lg` 16px, `mdt-pill` 999px.

### Elevation & Motion
- Shadows: `mdt-sm` (tokenized), `mdt-md` (tokenized), button shadows for hover/press.
- Motion: timing functions `ease-mdt-emphasized`, durations `mdt-fast` 120ms, `mdt-base` 180ms, `mdt-slow` 260ms.

## Usage in Tailwind
- Backgrounds: `bg-mdt-surface`, `bg-mdt-surface-subtle`.
- Text: `text-mdt-text`, `text-mdt-text-muted`, `text-mdt-primary`.
- Borders: `border-mdt-border`.
- Actions: `bg-mdt-primary`, `hover:bg-mdt-primary-strong`.
- Cards: `bg-mdt-surface shadow-mdt-sm border border-mdt-border`.
- Dark mode: toggle `.dark` on `html` or `body`; tokens swap via CSS variables.

## File map
- Tokens: `src/app/globals.css` (`:root` and `.dark` CSS variables).
- Tailwind bridge: `tailwind.config.ts` (`mdt` colors, radius, shadows, motion).
- Components: `src/components/**/*` and `src/components/ui/*` already consume `mdt-*` classes.

## Future improvements
- Add a “neutral” gray ramp for data viz.
- Introduce semantic spacing aliases (`space-2`, `space-3`) in components docs.
- Add dark-mode previews in Storybook/Playwright visual baselines.
- Consider a secondary display font for hero headlines if/when brand evolves.
