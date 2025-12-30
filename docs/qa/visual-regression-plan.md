# Visual Regression & Interaction Smoke Plan (Dec 2025)

## Scope pages (desktop + mobile)
- `/` (hero, featured, guided build band)
- `/browse` (filters, cards, empty state)
- `/snippets/[slug]` and `/templates/[slug]` (quality strip, tabs, related)
- `/builder` (3-pane layout)
- `/documents` (list + empty state)
- `/tags` (tag grid)
- `/atlas` (landing + compare widgets)
- `/docs` (docs landing + detail cards)
- `/changelog` (list + entry layout)
- `/privacy` and `/terms` (long-form text layout)

## Baselines
- Tool: Playwright screenshot tests per route and breakpoint (1280x720, 390x844).
- Store baseline images in `__tests__/__screenshots__` (or Playwright default).
- Update snapshots only via intentional run; review diffs in PRs.
- `pnpm test:visual` clears `NO_COLOR` to avoid Playwright FORCE_COLOR warnings while keeping output readable.
- Ensure the Living City header band is visible in `/`, `/browse`, `/builder`, `/atlas`, and `/docs` baselines.
- Interaction E2E specs run via Vitest (`npm run test:e2e -- <SpecName>`), not the Playwright test CLI.
- Known dev warnings to ignore vs investigate are listed in `docs/qa/known-warnings.md`.

## Smoke interactions
- Nav: open/close search sheet; theme toggle; command palette open+close.
- Browse: apply sort, add/remove tags, load more.
- Detail: copy/download actions; rendered/raw tab switch.
- Builder: create section, edit title, save (mocked), preview renders.
- Onboarding (when added): checklist completes first item.

## CI
- Add Playwright visual job gated on changed UI files.
- Fail CI on unexpected diffs; allow approve/update via `PLAYWRIGHT_UPDATE_SNAPSHOTS=1`.

## Acceptance per PR
- Baseline updated or unchanged for scoped pages.
- No hex lint failures; light/dark checked at least for `/` and `/browse`.
