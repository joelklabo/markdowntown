# Core flow user stories

Last updated: Dec 28, 2025

## Why this exists
These stories define the minimal, high-value paths the UI must support. Every interface update should map to one or more stories.

## User stories
1) **Scan to export (primary)**
   - As a repo owner, I scan a folder to see what instruction files load and go straight to Workbench to export agents.md.
   - Success criteria:
     - Scan summary clearly states loaded vs missing instruction files.
     - Primary CTA leads to Workbench with scan context intact.
     - Export action is obvious and completes successfully.

2) **Library to Workbench (secondary)**
   - As a team member, I start from a public artifact in Library and open it in Workbench to customize and export.
   - Success criteria:
     - Library list and preview highlight the "Open in Workbench" action.
     - Workbench opens with the chosen artifact preloaded.
     - Export action remains the next step.

3) **Translate to Workbench (secondary)**
   - As a maintainer, I paste existing instructions into Translate to convert and export agents.md quickly.
   - Success criteria:
     - Translate flow explains what is generated and where it goes.
     - Primary CTA opens Workbench after translation.
     - Export action completes without ambiguity.

4) **Landing clarity (entry)**
   - As a new user, I land on the homepage and immediately understand the 3-step path to value with a single primary CTA.
   - Success criteria:
     - One primary CTA: Scan a folder.
     - One secondary CTA: Open Workbench.
     - One tertiary link: Library (optional).

5) **Local-only trust (safety)**
   - As a cautious user, I want to confirm scans are local-only and no repo contents leave my device.
   - Success criteria:
     - Scan UI explicitly states local-only scanning.
     - Analytics and logs never include file paths or repo names.

## Interfaces touched
- Landing: hero, quick steps, CTA hierarchy.
- Scan: scan results summary, next steps CTA ordering.
- Workbench: onboarding, export panel, success confirmation.
- Library: list preview CTA and copy.
- Translate: input guidance and output CTA.
