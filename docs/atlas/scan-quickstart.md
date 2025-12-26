# Scan quickstart (Atlas Simulator)

Use Atlas Simulator to confirm which instruction files load for a tool and what to fix next.

## What you need
- A local repo folder to scan.
- A Chromium browser (Chrome/Edge/Arc) for directory picking, or the folder upload input in other browsers.

## 5-minute flow
1. Open **Atlas → Simulator**.
2. Click **Scan a folder** and select your repo root. If the picker is unavailable, use the folder upload input.
3. Confirm the detected tool and cwd (adjust in **Advanced** if needed). Retry if you hit a permission prompt.
4. Start with **Next steps** and follow the top action.
5. Open **Workbench** when you’re ready to build or export `agents.md` (scan context carries over).

## What you’ll see
- **Summary badges**: Loaded, Missing, Extra, Warnings.
- **Next steps**: prioritized fixes and actions.
- **Instruction health**: tool-specific checks and templates.
- **Content linting (optional)**: formatting warnings for instruction files.
- **Scan metadata**: file counts and truncation status.

## Privacy and data handling
- Scans run locally in your browser. File paths never leave your device.
- Content linting is optional; it only reads allowlisted instruction files and never uploads them.

## Troubleshooting
- **Directory picker not supported** → use the folder upload input (`webkitdirectory`).
- **Permission error** → re-open the picker, grant access, and click **Retry scan**.
- **No instruction files found** → add tool-specific files like `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, or `.github/copilot-instructions.md`.
- **Results are out of date** → adjust tool/cwd and click **Refresh results**.
- **Scan truncated** → scan a smaller folder or exclude large directories.
