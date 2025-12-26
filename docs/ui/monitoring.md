# UI Monitoring Runbook

Date: 2025-12-26
Scope: UI telemetry, error signals, and performance metrics for public release.

## Where to look
- PostHog events (production) when `NEXT_PUBLIC_POSTHOG_KEY` is set.
- Console output (dev) when PostHog is disabled.
- Browser DevTools Performance panel for local regressions.

## Core UI telemetry events
- `ui_route_view`: page views with path/referrer/viewport context.
- `ui_shell_loaded`: first shell render per session.
- `ui_theme_change`: theme toggles (`theme`, `previous`).
- `ui_density_change`: density toggles (`density`, `previous`).
- `ui_command_palette_open`: command palette entry (`origin`).

## Critical action events (track)
These are emitted by specific surfaces and should be reviewed by feature area:
- Navigation: `nav_click`, `nav_search_submit`, `nav_search_suggestion_click`.
- Atlas Simulator: `atlas_simulator_scan_start`, `atlas_simulator_scan_complete`, `atlas_simulator_next_step_action`.
- Workbench: `workbench_export_download`, `workbench_export_copy`, `workbench_save_artifact`.
- Builder/Browse/Templates/Snippets: `builder_copy`, `browse_card_use_template`, `template_use_builder`, etc.

## Error monitoring
- `atlas_simulator_scan_error`, `atlas_simulator_download_error`, `atlas_simulator_view_report_error`.
- `wordmark_banner_error`.
- Any `*_failed` events (e.g., `builder_save_failed`, `workbench_save_artifact_failed`).

## Performance monitoring
Events emitted by `PerfVitals`:
- Web vitals: `web_vital_lcp`, `web_vital_cls`, `web_vital_inp`, `web_vital_fcp`, `web_vital_ttfb`.
- Navigation timing: `perf_navigation`.
- SPA timing: `spa_nav`.
- API sampling: `perf_api`.
- Budget alerts: `perf_budget_violation`.

## Triage checklist
- Compare `ui_route_view` vs `ui_shell_loaded` counts; large gaps suggest boot issues.
- Review `ui_theme_change` and `ui_density_change` spikes after UI releases.
- Filter errors by route to identify failing surface.
- Check `perf_budget_violation` events for LCP/CLS regressions.

## Escalation guidance
- P0: sustained `perf_budget_violation` spikes on `/` or `/atlas/simulator`.
- P1: repeated `atlas_simulator_scan_error` or `workbench_export_*` failures.
- P2: intermittent theme/density toggling issues or minor nav search errors.
