# Monitoring & Alerting

## Sentry
- DSNs: set `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` in prod/stage.
- Releases/Env: set `SENTRY_ENVIRONMENT=production` and optionally `SENTRY_RELEASE` (git SHA) via CI.
- Alerts: In Sentry, create an alert rule for project "markdowntown" -> Issue Alert -> conditions: "Number of errors is above 1 in 5 minutes"; actions: notify email/Slack.

## PostHog
- Set `NEXT_PUBLIC_POSTHOG_KEY` (and `NEXT_PUBLIC_POSTHOG_HOST` if self-hosted).
- Verify pageviews and key events in PostHog; add alerts as needed in PostHog insights.
- UX telemetry events:
  - `ui_route_view`, `ui_shell_loaded` (route-level engagement)
  - `nav_click`, `nav_search_open`, `nav_search_submit`, `nav_search_quick_filter`
  - `builder_load`, `builder_save_success`, `builder_download`, `builder_copy`
  - Onboarding funnel events (see `docs/analytics/events.md`):
    - `atlas_simulator_scan_start`, `atlas_simulator_scan_complete`, `atlas_simulator_scan_cancel`, `atlas_simulator_scan_error`
    - `ui_route_view` with `route=/atlas/simulator` and `route=/workbench`
    - `workbench_export_download` / `workbench_export_copy` (recommended instrumentation)
- Web vitals / RUM (set `NEXT_PUBLIC_ENABLE_RUM=true`):
  - `web_vital_lcp`, `web_vital_cls`, `web_vital_inp`, `web_vital_ttfb`, `web_vital_fcp`
  - `perf_navigation`, `perf_api`, `spa_nav` (see `docs/perf-report.md` for dashboards)

## Onboarding funnel (scan → build → export)
Primary flow KPIs and suggested targets:
- **Scan completion rate:** `atlas_simulator_scan_complete / atlas_simulator_scan_start` → target 70%+
- **Workbench entry rate:** `ui_route_view(route=/workbench) / atlas_simulator_scan_complete` → target 40%+
- **Export rate:** `workbench_export_download or workbench_export_copy / ui_route_view(route=/workbench)` → target 25%+
- **Median time to export:** time from `atlas_simulator_scan_start` to export → target < 5 minutes
- **Scan error rate:** `atlas_simulator_scan_error / atlas_simulator_scan_start` → target < 5%

Build the funnel in PostHog once the export events are instrumented (see `docs/analytics/events.md`).

## Azure Monitor / Container Apps
- Logs already flow to Log Analytics workspace for env `satoshis-env-stg-west` (via ACA default).
- Quick queries:
  - Console logs: `ContainerAppConsoleLogs_CL | where ContainerAppName_s == "markdowntown-app" | limit 50`
  - System events: `ContainerAppSystemEvents_CL | where ContainerAppName_s == "markdowntown-app"`
- Suggested alerts (create in Azure Monitor):
  - Container not running / restart count spike.
  - CPU > 80% for 5m or Memory > 80% for 5m.
  - HTTP 5xx rate > 5% for 5m (via Log Analytics query on console logs).

## Health checks
- Endpoint: `https://markdown.town/api/health` returns `{status:"ok"}`. Use for uptime monitors (Pingdom/UptimeRobot/Azure availability test).

## Action items to enable alerts
1) Create Sentry issue alert as above.
2) In Azure Monitor, create metric alerts for CPU/Memory and a Log Analytics alert for 5xx.
3) Optionally set uptime monitor hitting `/api/health` every 1-5 minutes.
4) Performance: see `docs/perf-report.md` for RUM dashboards, SLOs, and Lighthouse automation (PR comments + artifacts).
