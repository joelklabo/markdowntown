# DevTools MCP smoke helper

Use this helper to capture console/network health for a route when running local QA flows.
It runs a headless Chromium session (Playwright) and reports console warnings/errors and
failed network requests.

## Usage
```bash
node scripts/qa/devtools-smoke.mjs --url http://localhost:3000/translate
```

Optional flags:
- `--timeout <ms>`: navigation timeout (default `15000`)
- `--wait <ms>`: extra wait after load to catch late errors (default `1000`)

## Expected output
- ✅ `DevTools smoke OK: no console warnings/errors or bad network responses.`
- ❌ Sections for `Console warnings`, `Console errors`, `Page errors`, `Request failures`, or `Bad responses`.

## Troubleshooting
- Ensure the dev server is running: `pnpm dev` (or `WATCHPACK_POLLING=true pnpm dev` if you see EMFILE).
- Retry with a longer timeout: `DEVTOOLS_SMOKE_TIMEOUT=30000 node scripts/qa/devtools-smoke.mjs --url http://localhost:3000/translate`.
- If MCP tooling is flaky, capture `/tmp/markdowntown-dev.log` and attach the smoke output to QA notes.
