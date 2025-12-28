# Dev Triage Notes

## Turbopack module factory error

### Symptoms (MCP)
- Dev server logs: "module factory is not available" for app route modules.
- Affected pages briefly return 500 after Fast Refresh.

### Likely trigger
- Next.js 16 Turbopack + frequent file changes in a large workspace.
- Occasionally accompanied by watchpack/too-many-open-files errors.

### Mitigation
- Default `pnpm dev` disables Turbopack via `NEXT_DISABLE_TURBOPACK=1`.
- Use `pnpm dev:turbo` only when validating Turbopack-specific behavior.
- If you must stay on Turbopack, restart the dev server after the error or raise file descriptor limits (macOS: `ulimit -n 2048`).

### Repro (when testing Turbopack)
1. Run `pnpm dev:turbo`.
2. Edit a client component (e.g., `src/components/atlas/AtlasSearch.tsx`) a few times to trigger Fast Refresh.
3. Reload `/atlas/simulator` or `/workbench` and observe the console error.

## DevTools MCP timeouts

### Symptoms
- DevTools MCP commands time out when opening pages.
- QA automation cannot capture console/network logs.

### Checks
1. Confirm the dev server responds: `curl -I http://localhost:3000`.
2. Close any stale DevTools MCP pages and open a fresh page.
3. If timeouts persist, restart the MCP bridge/agent and retry the page load.

### Repro (Codex MCP)
1. Start dev server: `WATCHPACK_POLLING=true WATCHPACK_POLLING_INTERVAL=1000 pnpm dev`.
2. Attempt a new page via MCP (e.g., `chrome-devtools/new_page` to `http://localhost:3000/`).
3. Observe tool timeout: `timed out awaiting tools/call after 60s` (no page opened).

### Notes
- Timeouts may occur even when the dev server is healthy; capture the MCP error text in QA notes.
