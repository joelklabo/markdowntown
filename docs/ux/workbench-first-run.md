# Workbench first-run + export guidance

Last updated: Dec 28, 2025

## Objective
Provide a calm, scan-aware onboarding path so first-time users know what to do next and how to export agents.md.

## Primary outcomes
- Users understand where their content comes from (scan context or templates).
- Users know the next action (add scopes/blocks, then export).
- Users feel safe: no repo content is uploaded; scan stays local-only.

## Entry states
### A) With scan context (preferred)
- Entry: from Atlas simulator via "Open Workbench" CTA.
- Signals to show:
  - Tool + cwd or scan paths summary.
  - Note that scan is local-only.

### B) Without scan context
- Entry: direct visit to /workbench or via Library/Translate.
- Signals to show:
  - Short explanation of what Workbench does.
  - CTA to scan a folder as the fastest path.

## Page structure (first run)
1) **Header summary**
   - Title: "Build your agents.md"
   - Subtext: "Add scopes and blocks, then export."
2) **Context panel**
   - If scan exists: "Scan defaults applied" + tool + cwd/paths.
   - If no scan: "No scan context yet" + CTA "Scan a folder".
3) **Next actions**
   - Primary: "Add scope" (or "Add block")
   - Secondary: "Import from Library" or "Translate instructions" when relevant.
4) **Export panel**
   - Primary CTA: "Export agents.md"
   - Helper: "Export writes a local agents.md file or copies to clipboard."

## Copy blocks (recommended)
### First-run hero
- Heading: "Build your agents.md"
- Helper: "Add scopes and blocks, then export when ready."

### Scan context (with scan)
- Heading: "Scan defaults applied"
- Helper: "Local-only scan. Nothing leaves your device."
- Detail line: "{tool} · cwd {path}" or list of scan paths.

### No scan context
- Heading: "No scan context yet"
- Helper: "Scan a folder to see which instruction files load and prefill Workbench."
- CTA: "Scan a folder"

### Export guidance
- Heading: "Export agents.md"
- Helper: "Copy or save a local agents.md file for your tool."

## Success and empty states
- **After export**: "Export complete. agents.md is ready."
- **Empty workbench**: "Add a scope or block to start building."

## Edge cases
- Scan context present but missing files: keep CTA "Open Workbench" and show a note "Some instruction files are missing."
- Multiple targets: prompt to select a target before export.

## Notes
- Use consistent terms: Scan, Workbench, Library, Translate, Export.
- Do not mention "builder" in any user-facing copy.
