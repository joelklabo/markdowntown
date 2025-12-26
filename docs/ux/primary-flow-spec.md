# Primary flow spec (UX clarity)

Last updated: Dec 26, 2025

## Primary persona
- New visitor with a repo who needs to understand how instruction files (AGENTS.md, agents.md, tool-specific files) will be loaded.

## Flow objective
- Make it obvious how to go from a folder scan to an exported agents.md.
- Remove ambiguity about which files are used and what to do next.

## Canonical flow (scan -> understand -> build/export)
1. **Start: Scan a folder**
   - Entry: `/atlas/simulator` (folder scan is the default action).
   - User action: pick a local folder and run the scan (directory picker or folder upload fallback).
   - Output: list of loaded instruction files, ordering/precedence, and missing files, plus scan summary badges.
2. **Review insights**
   - User action: read what loaded, what did not, and why.
   - Output: clear next step prompt (primary CTA).
3. **Build in Workbench**
   - Entry: `/workbench` (prefilled with scan context when available).
   - User action: assemble scopes and blocks; edit text.
   - Output: updated agents.md preview.
4. **Export or copy**
   - User action: copy markdown or export agents.md to disk.
   - Output: saved file or clipboard content.

## Success state
- User exports or copies a valid agents.md that matches their tool context, with clarity on where the content came from.

## Secondary flows
- **Library-first**: Browse templates/snippets in Library -> open in Workbench.
- **Translate**: Convert existing instructions into agents.md format.
- **Docs**: Read how the system interprets instructions and precedence.

## Primary entry points
- Home hero CTA -> `/atlas/simulator` (Scan a folder).
- Navigation primary -> `Scan` -> `/atlas/simulator`.
- Secondary CTA -> `/workbench` (Open Workbench).
- Secondary CTA -> `/library` (Browse Library).

## Related documentation
- User guide: `docs/USER_GUIDE.md`.
- Scan quickstart: `docs/atlas/scan-quickstart.md`.

## Required UI signals
- One primary CTA per surface (scan, then build, then export).
- Show the scan results summary above the first next-step CTA.
- Use consistent language: "Scan", "Workbench", "Export".
- Preserve scan context (tool + cwd) when sending users to Workbench.
- Document recovery affordances (retry on permission error, fall back to folder upload).

## Critical edge cases
- **No instruction files found**: explain what is expected and link to Docs.
- **Multiple tool targets**: prompt user to pick a target before building.
- **Permission errors**: explain how to grant read access and retry.
- **Unsupported picker**: direct users to the folder upload input.
- **Truncated scan**: explain that large folders should be narrowed or excluded.
