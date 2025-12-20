# Atlas Simulator: Folder Scan

Use the Atlas Simulator to preview which instruction files load for each tool based on your repo structure.

## Supported browsers
- Chromium-based browsers (Chrome, Edge, Arc) use the File System Access API for folder picking.
- Other browsers can still scan via the folder upload input (directory upload).

## Privacy and data handling
- Scans run locally in your browser.
- Only file paths are read to locate instruction files.
- File contents are never uploaded or stored server-side.

## Folder scan flow
1. Open Atlas → Simulator.
2. Select the tool you want to simulate.
3. Set Repo source to “Local folder”.
4. Choose your repo folder (or use the folder upload input in unsupported browsers).
5. Set Current directory (cwd) to where the tool runs (for example, `src/app`).
6. Click Simulate if you change inputs after a scan.
7. Review Loaded files, Insights, Warnings, and the scan metadata.

## Manual fallback
If you can’t access a local folder, switch to “Manual (paste paths)” and paste one repo path per line.

## Troubleshooting
- “File System Access API isn’t supported”: use the folder upload input instead.
- “Results are out of date”: adjust your inputs and click Simulate again.
- “No files found”: confirm the repo actually contains instruction files and that ignored folders (like `node_modules`) aren’t hiding them.
- “Scan truncated”: reduce the repo size or move large folders out of the scan scope.
