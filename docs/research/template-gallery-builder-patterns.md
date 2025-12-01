# Template Gallery & Doc Builder Patterns
Date: 2025-12-01  
Issue: markdowntown-7z8.2

## What we looked at
- Notion Template Gallery (public cards + “Use template” duplication).
- readme.so (form-driven markdown builder with live preview/export).
- GitHub Gist (raw + rendered views, copy/download, fork).
- Bonus scans: Google Docs/Slides templates, Canva doc templates, Linear issue templates.

## Interaction patterns worth copying
- **Dual CTA on cards:** “Preview” + “Use template” (Notion) lifts conversion; add badge chips (Staff pick / New / Trending).
- **Filter stack:** category + tag pills + sort (Trending/New/Top/Most copied); server-powered search with quick client refinements.
- **Detail layout:** left rail of metadata + actions; main column shows rendered view with tabs for Raw/Markdown and maybe JSON schema for placeholders.
- **Instant duplication:** single-click creates a personal copy (Notion/Linear) without forcing modal friction; show toast with link.
- **Form-fill overlays:** readme.so collects placeholder values in a focused panel and updates preview in real time; shows required vs optional fields.
- **Copy affordances:** floating “Copy” button near code block and top-right sticky CTA; secondary “Download .md”.
- **Provenance & stats:** author avatar/name, last updated, copies, votes, favorites, tags; trust badges reduce bounce.
- **Related content:** “More like this” with same tags + “Recently copied together” bundles (Gist forks, Canva sets).
- **Public-first defaults:** anonymous users can search, preview, copy/download; auth gates only for save/favorite/comment.

## Friction/risks to avoid
- Modal-only flows (extra clicks) reduce duplicate rates; prefer inline duplication then optional rename dialog.
- Mixing auth-only data (favorites/votes) inside cached public responses causes cache bleed—split calls or set `Vary: Cookie`.
- Overlong template descriptions push key CTAs below the fold; keep hero concise and place actions above the fold.

## Recommendations for agents.md builder
- Gallery cards: show type (Snippet/Template/Document), tags, badges (Staff pick/New/Trending), and primary “Use template” + secondary “Preview”.
- Detail page: two-tab view (Rendered | Raw) with right rail for stats/actions; add “Fill placeholders” panel that preloads defaults and streams live preview.
- Duplication: one-click “Use template” creates a working copy in the user’s workspace; toast with “Open in builder”.
- Copy/download: sticky top-right buttons for “Copy markdown” and “Download .md”; auto-scroll to bottom after copy success for confirmation.
- Bundles: surface “Commonly combined” snippets to assemble agents.md quickly; allow multi-select add-to-builder.
- Onboarding strip: lightweight explainer above the gallery describing agents.md and “How to assemble in 3 steps”.
- A/B opportunity: experiment with “Start with template” vs “Blank doc” prominence to see impact on completion.
