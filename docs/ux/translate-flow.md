# Translate flow spec

Date: 2025-12-28
Owner: UX

## Objective
Provide a fast, low-friction path from pasted instructions to a downloadable `agents.md` (or target format), with clear steps and minimal ambiguity.

## Primary flow (happy path)
1. **Select target(s)**
   - Default targets: AGENTS.md + GitHub Copilot.
   - Users can toggle targets on/off and expand Advanced options for adapter versions + target-specific options.
2. **Paste input**
   - Accept Markdown or UAM JSON.
   - Detect input type and surface a “Detected: Markdown/UAM v1” badge.
3. **Compile**
   - Primary CTA is “Compile”.
   - On success, show Results with generated files.
4. **Download**
   - Secondary CTA “Download zip” becomes enabled after a successful compile.
   - Zip filename: `outputs.zip`.
5. **Review (optional)**
   - Users can view generated file contents and copy individual files.

## CTA hierarchy
- **Primary:** Compile
- **Secondary:** Download zip (disabled until compile succeeds)
- **Tertiary:** Advanced options toggle

## Validation + error states
- **No targets selected:** Disable Compile and show “Select a target”.
- **Empty input:** Disable Compile; keep results empty.
- **Input too large (>200k chars):** Block compile with “Input is too large to compile.”
- **Invalid advanced options JSON:** Inline error “Invalid JSON options”.
- **API/compile error:** Show error message in Output panel.

## Target selection rules
- Targets are required to compile; at least one must be selected.
- Advanced options allow adapter version overrides and per-target options JSON.
- When multiple targets are selected, compile produces multiple files.

## Edge cases
- Example query params can prefill input; missing examples show an inline error.
- UAM JSON detection should prefer valid UAM v1 over generic JSON.
- Large inputs warn at 50k chars and hard-stop at 200k chars.

## Copy + terminology
- Use “Translate” as the surface label.
- Use **AGENTS.md** for repo instruction file and **agents.md** for exported output.
- Keep helper text to 1–2 sentences, action-oriented.

## References
- docs/ux/microcopy-guidelines.md
- docs/design/content-design-system.md
