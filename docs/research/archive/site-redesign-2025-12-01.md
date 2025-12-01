# Site Redesign Research (Public Library & agents.md Builder)
Date: 2025-12-01

## Goals
- Allow anonymous visitors to browse, search, and copy markdown snippets/templates; keep auth for create/favorite/vote/comment.
- Support reusable `agents.md` files assembled from snippets and templates (placeholders + form fill).
- Surface engaging, high-signal content on landing: trending/new snippets, top templates, most-copied agents.md files, tag clouds.

## Competitive/Pattern Scan
- **FlowGPT** – Community prompt library; highlights curated/trending prompts with simple share/copy actions to drive reuse.
- **PromptBase** – Marketplace model with prompt detail pages, search + filtering by model/category; promotes top sellers and featured prompts on landing for discovery.
- **PromptHero/PromptMetheus** – Prompt galleries with search, popularity signals, and multi-model filters; focus on fast browse + copy flow.
- **Notion Template Gallery** – Public template cards with category filters and “Use template” CTA that duplicates a template into your workspace; showcases staff picks and trending sections.
- **GitHub Gist Explore** – Public code snippets with star/fork/copy/download; detail page keeps raw + rendered views and author attribution to encourage sharing.
- **readme.so** – Markdown page builder with left-rail section list you can toggle on/off and export/copy; demonstrates template-as-form factor for docs.

## UX Takeaways
- Landing should immediately show valuable content (featured/top/new) with copy/download CTAs—no auth wall.
- Fast discovery needs search + tag pills + sort (Trending/New/Most copied/Top rated) plus filters (tool, model, category).
- Detail pages work best with dual layout: rendered markdown + raw copy, stats (copies, votes), author, tags, related items.
- Template flows benefit from form-driven placeholder fills with instant preview/export (readme.so pattern).
- Community signals (votes, copies, comments) and badges (“Staff pick”, “New”) help visitors trust snippets.

## Data Model Implications
- Distinguish **Snippet** (formerly Section) from **File/Document** (`agents.md`) and **Template** (has placeholders + default values).
- Track per-snippet stats: views, copies, downloads, favorites, last-updated; store tags/categories and visibility (public/unlisted/private).
- Allow Documents to reference snippets by id and capture order + overrides; enable versioning so updates propagate.
- Templates should store schema for fields (name, type, default, description) plus render string and optional validation.

## Risks / Constraints
- Anonymous traffic increases read load—need caching/ISR and stricter abuse/rate limits on write actions.
- Copy/download endpoints must strip secrets and enforce content validation to avoid injection.
- Schema migration (Section→Snippet, new Document/Template tables) will require backfill + API contract changes.
