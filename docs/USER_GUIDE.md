# User Guide

This guide walks you through the primary flow: scan a folder → review loaded instruction files → build and export agents.md.
Scans run locally in your browser and do not upload file contents.

![Scan to Workbench flow](./assets/scan-workbench-flow.svg)

Flow overview: quick upload scan → review results → open Workbench with tool + cwd prefilled.

## Primary flow (6 steps)
1. Open the Atlas Simulator and click **Scan a folder** (Quickstart: `docs/atlas/scan-quickstart.md`).
2. Pick your repo root. If the directory picker is unavailable, use the folder upload input. If you hit a permission error, grant access and retry.
3. Confirm the detected tool + cwd (adjust in **Advanced** if needed). Review **Next steps** first, then Instruction health, the ordered list of instruction files, and any warnings. Use **Copy template** or **Refresh results** to fix issues quickly.
4. Open **Workbench** from the Next steps CTA. Scan context (tool + cwd) is prefilled so you can build immediately.
5. Add scopes and blocks, then write the instructions you want to ship. Use **Preview** and **Lint** to validate.
6. Export `agents.md` or download the zip and commit the file to your repo.

## Helpful tips
- Use the Instruction health guide for tool-specific checklists: `docs/atlas/instruction-health.md`.
- Use Library to browse public artifacts and open them in Workbench.
- Use Translate to convert between instruction formats for different tools.
- Terminology: AGENTS.md refers to a repo file; agents.md is the exported output from Workbench.

## Edge cases and recovery
- **Directory picker not supported** → use the folder upload input (`webkitdirectory`).
- **Permission error** → re-open the picker and grant access to the repo folder, then retry the scan.
- **Scan truncated** → exclude large folders or scan a narrower subfolder.
- **No instruction files found** → add tool-specific files like `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, or `.github/copilot-instructions.md`.
