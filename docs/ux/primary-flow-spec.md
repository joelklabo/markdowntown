# Primary flow spec (UX clarity)

Last updated: Dec 28, 2025

## Primary persona
- New visitor with a repo who needs to understand how instruction files (AGENTS.md, agents.md, tool-specific files) will be loaded.

## Flow objective
- Make it obvious how to go from a folder scan to an exported agents.md.
- Remove ambiguity about which files are used and what to do next.
- Keep the primary surfaces limited to Scan, Workbench, Library, Translate, and Docs.

## Canonical flow (scan -> understand -> build/export)
1. **Start: Scan a folder**
   - Entry: `/atlas/simulator` (folder scan is the default action).
   - User action: pick a local folder and run the scan (directory picker or folder upload fallback).
   - Output: list of loaded instruction files, ordering/precedence, and missing files, plus scan summary badges.
2. **Review insights**
   - User action: read what loaded, what did not, and why.
   - Output: clear next step prompt (primary CTA) that routes to Workbench when ready.
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
- Tertiary CTA -> `/library` (Browse Library; use once on Home or Library preview).
- Tertiary entry points (de-emphasized): `/templates`, `/tags`, `/atlas`.

## Home layout mapping (scan-first)
1. Hero: scan-first value + primary/secondary CTAs.
2. Quick-start steps: Scan → Review → Export.
3. Proof/preview: confirms Workbench output readiness.
4. Minimal Library preview: secondary discovery path only.
5. Final CTA block: reinforce Scan → Workbench.

## Related documentation
- User guide: `docs/USER_GUIDE.md`.
- Scan quickstart: `docs/atlas/scan-quickstart.md`.

## Required UI signals
- One primary CTA per surface (scan, then build, then export).
- Show the scan results summary above the first next-step CTA.
- Use consistent language: "Scan", "Workbench", "Export".
- Preserve scan context (tool + cwd) when sending users to Workbench.
- Document recovery affordances (retry on permission error, fall back to folder upload).

## CTA hierarchy rules
- **Ready state:** primary CTA is **Open Workbench**; secondary actions are Share (Copy summary) and Download report.
- **Error/warning states:** one primary fix action per step (Copy template, Set cwd, Switch tool). Secondary actions are optional and should not compete.
- **No scan state:** primary CTA is Scan a folder (or Upload folder when picker is unavailable); secondary CTA is Paste paths.

## Critical edge cases
- **No instruction files found**: explain what is expected and link to Docs.
- **Multiple tool targets**: prompt user to pick a target before building.
- **Permission errors**: explain how to grant read access and retry.
- **Unsupported picker**: direct users to the folder upload input.
- **Truncated scan**: explain that large folders should be narrowed or excluded.
