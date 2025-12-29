# DevTools MCP QA

## Quick start
1. Start the app locally:
   - `npm run dev`
2. (Optional) Verify the dev server is reachable:
   - `npm run mcp:health`
3. Run the Playwright-based smoke check (fallback when MCP is flaky):
   - `node scripts/qa/devtools-smoke.mjs --url http://127.0.0.1:3000 --health 1 --retries 2`

## Health probe
The health probe issues a lightweight `HEAD` request before launching Playwright. Configure it with:
- `DEVTOOLS_SMOKE_HEALTH=1`
- `DEVTOOLS_SMOKE_HEALTH_TIMEOUT=2000`

## Retries
`devtools-smoke` will retry navigation if the page is still compiling or the dev server is warming up:
- `DEVTOOLS_SMOKE_RETRIES=2`
- `DEVTOOLS_SMOKE_RETRY_DELAY=500`

## Troubleshooting
- MCP timeouts: restart the MCP bridge/agent and rerun `npm run mcp:health`.
- Slow dev server startup: increase `DEVTOOLS_SMOKE_RETRIES` and `DEVTOOLS_SMOKE_TIMEOUT`.
- EMFILE watch errors: set `WATCHPACK_POLLING=true` and `WATCHPACK_POLLING_INTERVAL=1000` before `npm run dev`.
- If MCP is unavailable: rely on `node scripts/qa/devtools-smoke.mjs` and attach screenshots/logs to QA notes.
