# Atlas Simulator: Scan a Folder

Use the Atlas Simulator to preview which instruction files load for each tool based on your repo structure.

## Supported browsers
- Chromium-based browsers (Chrome, Edge, Arc) use the File System Access API for folder picking.
- Other browsers can still scan via the folder upload input (directory upload).

## Privacy and data handling
- Scans run locally in your browser.
- Only file paths are read to locate instruction files.
- File contents are never read, uploaded, or stored server-side by default.
- Optional content linting (opt-in) reads instruction file contents locally to surface formatting issues. Content never leaves your browser.

## Folder scan flow
1. Open Atlas → Simulator.
2. Select the tool you want to simulate.
3. Set Current directory (cwd) to where the tool runs (for example, `src/app`).
4. Click “Scan a folder” (or use the folder upload input in unsupported browsers).
5. Click “Refresh results” if you change the tool, cwd, or paths.
6. Review Instruction health, Summary, Loaded files, Insights, Warnings, and the scan metadata.

## Instruction health check
The Instruction health panel validates file placement for the selected tool and highlights missing or misplaced instruction files.
- It shows pass/warn/fail status plus actionable fixes.
- You can copy a template file or jump to Workbench when files are missing.
- Use the Fix summary button to share issues with teammates.

See the dedicated guide: `docs/atlas/instruction-health.md`.

## Optional content linting
Enable “Content linting (local-only)” to read instruction files locally and surface common formatting issues.
- Only allowlisted instruction paths are read.
- Files larger than 64 KB are skipped or truncated.
- The panel summarizes warnings and suggests fixes (e.g., missing `applyTo` front matter).

## Manual fallback
If you can’t access a local folder, open “Advanced: paste repo paths” and paste one repo path per line.

## Troubleshooting
- “File System Access API isn’t supported”: use the folder upload input instead.
- “Results are out of date”: adjust your inputs and click Refresh results again.
- “No files found”: confirm the repo actually contains instruction files and that ignored folders (like `node_modules`) aren’t hiding them.
- “Scan truncated”: reduce the repo size or move large folders out of the scan scope.
