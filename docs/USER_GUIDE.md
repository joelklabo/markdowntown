# User Guide

This guide walks you through the primary flow: scan a folder → review loaded instruction files → build and export agents.md.
Scans run locally in your browser and do not upload file contents.

## Primary flow (6 steps)
1. Open the Atlas Simulator and click **Scan a folder**. (Quickstart: `docs/atlas/scan-quickstart.md`.)
2. Pick your repo. The simulator auto-detects the tool and cwd when it can (override in Advanced if needed).
3. Review the Next steps panel first, then Instruction health, the ordered list of instruction files, and any warnings. Use Copy template or Refresh results actions to fix issues quickly.
4. Open Workbench to assemble your output.
5. Add scopes and blocks, then write the instructions you want to ship. Use Preview and Lint to validate.
6. Export agents.md or download the zip and commit the file to your repo.

## Helpful tips
- Use the Instruction health guide for tool-specific checklists: `docs/atlas/instruction-health.md`.
- Use Library to browse public artifacts and open them in Workbench.
- Use Translate to convert between instruction formats for different tools.
- Terminology: AGENTS.md refers to a repo file; agents.md is the exported output from Workbench.
