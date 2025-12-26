# Dev Triage Notes

## Turbopack module factory error

### Symptoms
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
