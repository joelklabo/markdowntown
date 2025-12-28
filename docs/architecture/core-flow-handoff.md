# Core Flow Handoff Contract

## Purpose
Define the client-only contract for handing off context from Scan, Library, and Translate into Workbench while preserving user intent across refresh and back navigation.

## Scope
- Client-only handoff (no server persistence).
- Primary surfaces: Scan (/atlas/simulator), Library (/library), Translate (/translate), Workbench (/workbench).
- Export target: agents.md.

## Handoff Principles
- **Minimal URL payloads:** URLs should carry only lightweight identifiers or flags.
- **Local persistence:** Use sessionStorage for short-lived drafts.
- **No sensitive data in URLs:** Avoid file paths, cwd, or repo names in query params.
- **Graceful failure:** If handoff data is missing/invalid, present a clear recovery CTA.

## Data Contract (Draft)

### Common fields
- `handoffId` (string, required): unique per handoff to avoid collisions across tabs.
- `source` (enum: scan | library | translate, required)
- `timestamp` (ISO string, required)
- `version` (string, required) — schema version for backward compatibility.

### Scan context payload
- `toolId` (string)
- `cwd` (string, redacted in analytics)
- `paths` (string[]; file paths; not in URL)
- `loadedCount` (number)
- `missingCount` (number)
- `warnings` (string[])

### Library context payload
- `artifactId` (string)
- `artifactTitle` (string)
- `artifactType` (string)
- `artifactVersion` (string | null)

### Translate context payload
- `inputType` (string)
- `targetIds` (string[])
- `outputFiles` (array of { path: string; size: number })
- `compileStatus` (success | error)

## Persistence Strategy

### URL params
- Use for `handoffId`, `source`, and shallow flags only.
- Do not include file paths or large arrays.
- Guard against URL length limits (2–8KB typical).

### sessionStorage
- Key: `workbench_handoff_${handoffId}`.
- Store full payloads for scan/library/translate.
- Expiration: clear on export success or after 24 hours.

### Large payloads
- If payload exceeds a safe size (~250KB), store a compact summary in sessionStorage and show a warning toast in Workbench with a CTA to rescan or reopen the artifact.

## Back/Forward Behavior
- Back from Workbench should return to the originating surface when possible.
- Preserve scroll position in Library and Translate when returning.
- If history state is missing, fall back to the surface root route.

## Validation & Error Handling
- Validate payloads on Workbench entry (schema version + required fields).
- If invalid or missing, show a banner: "We couldn't load that context. Start a new Scan, pick a Library item, or Translate again."
- Provide primary CTA based on `source` (Scan a folder, Browse Library, Open Translate).

## Telemetry (Privacy-safe)
- Track handoff success/failure events without paths/cwd:
  - `workbench_handoff_start`
  - `workbench_handoff_success`
  - `workbench_handoff_failed` (reason: missing | invalid | too_large)

## Risks
- sessionStorage size limits (~5MB per origin) may fail for large scans.
- Multiple tabs can overwrite data without unique `handoffId` keys.
- Client-only storage is not shareable; deep links will not carry full context.

## Open Questions
- Should large payloads use IndexedDB to avoid sessionStorage limits?
- Do we need a short-lived server draft ID for shareable links?
