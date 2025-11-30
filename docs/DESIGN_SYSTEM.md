# MarkdownTown Design System (MVP)

## Tokens
Defined in `tailwind.config.ts` under `theme.extend`:
- Colors: `mdt.blue`, `mdt.red`, `mdt.yellow`, bg/bg-soft, border, text, muted, success, danger.
- Radius: `mdt-sm` 6px, `mdt-md` 10px, `mdt-lg` 16px, `mdt-pill` 999px.
- Shadows: `mdt-sm`, `mdt-md`, `mdt-btn`, `mdt-btn-hover`.
- Typography sizes: `display`, `h1`, `h2`, `h3`, `body`, `body-sm`, `caption`.
- Font: `font-sans` uses CSS var `--font-inter` (set in layout).

## Globals
`src/app/globals.css`:
- Applies base bg/text via Tailwind `@layer base`.
- Component utilities:
  - `.btn`, `.btn-primary`, `.btn-secondary`
  - `.card`
  - `.pill`, `.pill-primary`, `.pill-yellow`
- Markdown preview styles for rendered content.

## Font
`src/app/layout.tsx` loads Inter (swap) with CSS var `--font-inter`; body uses `font-sans`.

## Primitives
- `BrandLogo`: icon + optional wordmark, size prop.
- `Button`: variant (`primary` | `secondary` | `ghost`), size (`sm` | `md` | `lg`), `asChild` support.
- `Card`: simple wrapper (`className` passthrough).
- `Pill`: tone (`primary` | `yellow`).
- Helper: `cn` in `src/lib/cn.ts`.

## Assets
- `public/markdown-town-icon.svg` (brand icon).

## Usage example
See `src/app/page.tsx` for header/hero built with tokens + primitives. Import components from `@/components/...`.

## Conventions
- Prefer Tailwind tokens (mdt-*) over hex literals.
- Use `asChild` on Button when wrapping Links to keep semantics.
- Keep new shared components under `src/components/ui/`.

## Roadmap ideas
- Add dark mode token set.
- Add text style utilities (e.g., `text-mdt-h1`).
- Add form controls (inputs, selects) and alert banners.
