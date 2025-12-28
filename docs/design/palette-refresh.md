# Palette Refresh 2025 · Direction + Token Map

Date: 2025-12-28
Owner: Design
Goal: Refresh the semantic color system to feel premium, calm, and confident while staying aligned with the Living City wordmark.

## Design intent
- **Crisp, calm base**: cooler neutrals with soft contrast for surfaces.
- **Electric clarity**: a cool cyan primary for focus/CTA emphasis.
- **Warm accent**: a controlled amber accent for highlights and attention without overwhelming the UI.
- **Status clarity**: success/warn/danger/info stay distinct and readable in both themes.

## Semantic roles + usage
- **Primary**: primary CTA, active states, focus emphasis.
- **Primary strong**: hover/active for primary CTA, ring emphasis.
- **Primary soft**: subtle fills (pills, chips, highlights).
- **Accent**: secondary emphasis (badges, highlights, accent borders).
- **Accent soft**: subtle accent fills.
- **Surfaces**: layered panels (bg, surface, surface-subtle, surface-strong, surface-raised).
- **Borders**: low-contrast dividers + stronger emphasis for active edges.
- **Text**: base, muted, subtle, on-strong (reversed).

## Light palette targets (HSL)
- **Base neutrals**: cool blue-gray hue (220–222), low saturation.
- **Primary (cyan)**: hue 195–200, sat 75–90, lightness 50–62.
- **Accent (amber)**: hue 38–42, sat 90–96, lightness 50–62.
- **Text**: near-black blue-gray (hsl 222 50% 9%).
- **Borders**: low-contrast blue-gray (hsl 220 16% 84%).

## Dark palette targets (HSL)
- **Base neutrals**: cool charcoal (220–222), low saturation.
- **Primary (cyan)**: hue 195–200, sat 80–90, lightness 60–72.
- **Accent (amber)**: hue 38–42, sat 95–98, lightness 60–70.
- **Text**: near-white blue-gray (hsl 220 33% 92%).
- **Borders**: low-contrast charcoal (hsl 220 18% 30%).

## Contrast targets
- **Body text on surface**: >= 4.5:1.
- **Muted text on surface**: >= 3.0:1.
- **Primary CTA text on primary**: >= 4.5:1.
- **Focus ring vs surface**: >= 3.0:1.

## Wordmark + header alignment
- Wordmark skyline should remain readable in both themes with **>= 3:1** contrast.
- Use the primary cyan as a subtle glow anchor, not a full background.
- Keep the header as the most saturated surface; UI surfaces should feel calmer.

## Token mapping checklist
- Update `--mdt-color-primary`, `--mdt-color-primary-strong`, `--mdt-color-primary-soft`.
- Update `--mdt-color-accent`, `--mdt-color-accent-soft`.
- Update `--mdt-color-success|warning|danger|info` and soft counterparts.
- Update `--mdt-color-bg`, `--mdt-color-surface*`, `--mdt-color-border*`, `--mdt-color-text*`, `--mdt-color-ring`.
- Update data-viz palette tokens to match primary/accent hues.

