# PRD: Public Library & agents.md Builder
Date: 2025-12-01
Owner: product/ux
Epic: markdowntown-7z8

## Problem
- Today the app hides almost all value behind login; anonymous visitors bounce before seeing content.
- Users maintain `agents.md` snippets across multiple projects and want a single source of truth, plus templates and quick export.
- Switching repos or tools causes drift because sections aren’t shared or easy to copy/download.

## Goals
- Let anyone browse, search, and copy/export snippets/templates/agents.md files without signing in.
- Make it easy to assemble an `agents.md` from a library of reusable snippets and templates (with placeholders) and export/download/copy.
- Encourage signup for save/favorite/vote/comment while keeping browsing uninterrupted.

## Non-goals (for this release)
- Monetization/paid marketplace for prompts.
- Multi-tenant org/workspace model.
- Fine-grained ACL beyond public/unlisted/private.

## Users & JTBD
- **Anonymous visitor**: discover high-quality snippets/templates; copy/download instantly; decide to sign up after seeing value.
- **Returning builder**: quickly assemble or update `agents.md` using saved favorites and recent snippets; export or save a versioned file.
- **Contributor**: publish snippets/templates, track their usage (views/copies), and collect feedback via votes/comments.

## Key user stories
- As an anon user, I can land on the homepage and immediately see featured/trending/new snippets/templates and copy any of them.
- As an anon user, I can search by tag/model/tool and filter results, then copy/download a snippet or template.
- As an anon user, I can open a snippet/template detail page, see rendered + raw markdown, stats, tags, and related items.
- As an anon user, I can start a builder flow: pick a template or blank, add snippets, reorder, preview, and copy/download the final `agents.md` (no save).
- As an authed user, I can favorite/pin snippets/templates, vote/comment, and save/export my assembled agents.md as a Document tied to my account.
- As an authed user, I can clone a public agents.md file into my workspace and customize it.

## Functional requirements
- Public routes: landing, browse/search, snippet detail, template detail, tags, builder (read/export). No auth required.
- Gated actions: create/update/delete, vote, favorite/pin, comment, save document, download with attribution? (TBD). Inline sign-in prompts must preserve action context.
- Discovery: sorting (Trending, New, Most copied, Top rated), tag filters, search bar with suggestions, tag cloud on landing.
- Detail pages: rendered markdown + raw view, stats (views/copies/downloads/votes), author attribution, tags, related items, copy/download buttons, “Add to builder”.
- Templates: placeholder schema, form-driven fill, live preview, copy/download with substitutions; “Save as Document” for authed.
- Builder: multi-step wizard (Template → Snippets → Arrange → Preview → Export); supports anon export (no persistence) and authed save/versioning.
- Stats/events: track views, copies, downloads, template-fills, builder-exports; surface counters on cards and detail pages.
- SEO: public pages crawlable; per-item meta/OG; sitemap.
- Accessibility/responsiveness: full mobile/desktop support; keyboard-friendly copy buttons.

## Non-functional requirements
- Performance: TTFB for public pages <200ms p75 via caching/ISR; search results <400ms p75.
- Reliability: public browse still works if auth service is degraded; rate-limits and abuse protection on write paths.
- Security: sanitize markdown/templates; CSP; rate-limit votes/comments/creates; protect private/unlisted content from indexing.

## Success metrics (30 days post-launch)
- Copy/download rate per visitor +25% vs current baseline.
- Anonymous-to-signup conversion +15% driven by gated actions.
- Median time-to-first-copy <20s from landing.
- At least 20% of saved Documents built via templates (template adoption).

## Rollout & gating
- Feature flags: `public_library`, `builder_v2`, `templates_v1`.
- Staged rollout: enable public landing/browse first; then detail pages; then builder/templates; finally votes/comments.
- Backfill/migration: dual-write Section→Snippet until confidence; protect old APIs with compatibility layer.

## Open questions
- Do we support downvotes or only upvotes/likes? (affects ranking).
- Should copies/downloads require logged-in attribution? Likely no for frictionless anon UX.
- Storage limits for saved Documents and templates per user.

