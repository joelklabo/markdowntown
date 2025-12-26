# IA Map (Information Architecture)

Date: 2025-12-26
Scope: Primary navigation, secondary paths, and key user journeys.

## Global navigation

### Primary (desktop header)
- Scan → `/atlas/simulator`
- Workbench → `/workbench`
- Library → `/library`
- Translate → `/translate`
- Docs → `/docs`

### Primary (mobile bottom nav)
- Scan, Workbench, Library, Translate, Search
- Overflow sheet for: Docs, Atlas, Changelog, Privacy, Terms, GitHub

### Utilities / CTAs
- Search (header + mobile sheet) → `/library?q=...`
- Command palette (header + overflow) → global action surface
- Theme + density toggles (header / overflow)
- Auth: Sign in/out → `/signin`, `/api/auth/*`
- “Use a template” CTA → `/templates`

## Core surfaces

### Home
- `/` (hero, CTA to Scan/Workbench, library previews)

### Atlas (instruction discovery)
- `/atlas` (Explore)
- `/atlas/simulator` (Scan a folder)
- `/atlas/compare`
- `/atlas/platforms/[platformId]`
- `/atlas/concepts`
- `/atlas/recipes`
- `/atlas/changelog/*`

### Workbench (composition)
- `/workbench`
- `/builder` (currently overlaps Workbench; needs clarity)

### Library / Browse (public artifacts)
- `/library` (filters + list)
- `/browse` (public browsing surface)
- `/tags`, `/snippets`, `/templates`
- `/a/[slug]` (artifact detail)

### Translate
- `/translate` (compile markdown/UAM to target formats)

### Docs / Legal
- `/docs`
- `/changelog`
- `/privacy`
- `/terms`

### Labs / Diagnostics
- `/labs/city-logo`
- `/tokens`

## Scan funnel entry + exit

### Entry points
- Nav: Scan → `/atlas/simulator`
- Home CTA: Scan a folder / Validate instructions
- Docs quickstart: Scan guide → `/atlas/simulator`
- Library empty state: "Scan a folder to see what loads"

### Exit points
- Primary: Results → Open in Workbench (`/workbench`)
- Secondary: Adjust CWD / Rescan with another tool
- Tertiary: Export report / Copy results summary

## Key user journeys

1. **First-time validation**
   - Home → Scan a folder → Results/Next Steps → Workbench → Export agents.md
2. **Template discovery**
   - Home/Library → Open artifact → Workbench (edit) → Export
3. **Translation path**
   - Translate → Paste or upload → Compile → Download
4. **Docs-driven**
   - Docs → Atlas (concepts/recipes/platforms) → Scan or Workbench

## IA risks / simplifications (≥5)
- Builder vs Workbench are ambiguous; users can’t tell which is the primary surface.
- Atlas content overlaps with Docs (Concepts/Recipes/Platforms), creating two “learning” entry points.
- Library vs Browse vs Templates vs Snippets are separate routes; mental model isn’t clear.
- Mobile bottom nav lacks Docs/Atlas, but overflow does; discoverability gap on mobile.
- “Scan” label in nav maps to `/atlas/simulator`, but Atlas section also has “Explore,” which dilutes hierarchy.
- “Use a template” CTA routes to `/templates`, but Library also contains templates → duplicate discovery paths.
- Changelog appears under both `/changelog` and `/atlas/changelog/*` (fragmented update story).
