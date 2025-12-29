# Contrast + focus audit (palette refresh)

Date: 2025-12-29
Owner: @honk

## Scope
- Light + dark themes using semantic tokens in `src/app/globals.css`.
- Primary surfaces, buttons, and status pills/badges.
- Focus ring visibility against default surfaces.

## Method
- WCAG contrast ratio math (relative luminance) against token HSL values.
- Thresholds: 4.5:1 for normal text, 3:1 for large text and focus indicators.
- Soft status backgrounds computed by compositing the token’s alpha over the surface color.

## Results (light theme)

| Pair | Ratio | Result |
| --- | --- | --- |
| Text on surface (`text` / `surface`) | 18.18 | Pass |
| Muted text on surface (`text-muted` / `surface`) | 6.89 | Pass |
| Subtle text on surface (`text-subtle` / `surface`) | 4.66 | Pass (borderline) |
| Text on surface-subtle (`text` / `surface-subtle`) | 16.90 | Pass |
| Muted text on surface-subtle (`text-muted` / `surface-subtle`) | 6.40 | Pass |
| Subtle text on surface-subtle (`text-subtle` / `surface-subtle`) | 4.33 | Fail (normal text) |
| Primary button text (`text-on-strong` / `primary`) | 8.30 | Pass |
| Primary-strong button text (`text-on-strong` / `primary-strong`) | 6.72 | Pass |
| Success text on success-soft | 2.26 | Fail |
| Warning text on warning-soft | 2.06 | Fail |
| Danger text on danger-soft | 3.53 | Fail |
| Info text on info-soft | 2.49 | Fail |

## Results (dark theme)

| Pair | Ratio | Result |
| --- | --- | --- |
| Text on surface (`text` / `surface`) | 14.52 | Pass |
| Muted text on surface (`text-muted` / `surface`) | 9.06 | Pass |
| Subtle text on surface (`text-subtle` / `surface`) | 6.65 | Pass |
| Text on surface-subtle (`text` / `surface-subtle`) | 13.05 | Pass |
| Muted text on surface-subtle (`text-muted` / `surface-subtle`) | 8.14 | Pass |
| Subtle text on surface-subtle (`text-subtle` / `surface-subtle`) | 5.98 | Pass |
| Primary button text (`text-on-strong` / `primary`) | 8.86 | Pass |
| Primary-strong button text (`text-on-strong` / `primary-strong`) | 10.23 | Pass |
| Success text on success-soft | 7.09 | Pass |
| Warning text on warning-soft | 6.90 | Pass |
| Danger text on danger-soft | 4.17 | Fail (normal text) |
| Info text on info-soft | 6.47 | Pass |

## Focus rings

| Indicator | Ratio | Result |
| --- | --- | --- |
| Ring on light surface (`ring` @ 45% alpha) | 1.44 | Fail (below 3:1) |
| Ring on dark surface (`ring` @ 45% alpha) | 2.58 | Fail (below 3:1) |

## Findings
- Light theme status pills/badges (success/warning/info/danger) do not meet 4.5:1 for normal text on soft backgrounds.
- Light theme `text-subtle` on `surface-subtle` is below 4.5:1 (4.33).
- Focus ring contrast is below 3:1 on both light and dark surfaces at current alpha.
- Dark theme danger on danger-soft is slightly below 4.5:1.

## Recommendations
- Increase contrast for status pills/badges in light theme: darken text color or reduce background tint; consider using `text` for warning/info labels when shown as body/caption size.
- Bump danger text contrast in dark theme soft variant (slightly darker text or lighter background).
- Increase focus ring opacity or add a dual-ring/outline to hit 3:1 on default surfaces.
- Reserve `text-subtle` for large or non-critical text on light `surface-subtle`; otherwise use `text-muted`.

## Follow-up tasks
- markdowntown-45rr — Fix status soft contrast (light theme + dark danger).
- markdowntown-da2s — Improve focus ring contrast to >= 3:1.
- markdowntown-e1tq — Improve subtle text contrast on surface-subtle.
