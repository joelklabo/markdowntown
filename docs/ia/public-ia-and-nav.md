# IA & Navigation: Public-First MarkdownTown
Date: 2025-12-01
Epic: markdowntown-7z8

## Top-level navigation (desktop)
- Browse (default to /browse?sort=trending)
- Templates (/templates)
- Builder (/builder)
- Tags (/tags)
- Docs (/docs or AGENTS.md link)
- Auth cluster (Sign in / Profile avatar + dropdown)

## Mobile navigation
- Bottom nav: Browse, Templates, Builder, Tags, Profile
- Hamburger menu for Docs/About and secondary links

## URL map
- `/` – Landing (featured, trending, new, tag cloud, most-copied agents.md files)
- `/browse` – Library list (snippets + agents files + templates, filterable by type, tags, tool/model, sort: trending/new/top/copied)
- `/snippets/[slug]` – Snippet detail (rendered + raw, stats, tags, related, add-to-builder)
- `/templates/[slug]` – Template detail with form fill + live preview + copy/download; “Save as Document” (authed)
- `/files/[slug]` – agents.md document detail (rendered, raw, components list, copy/download, clone)
- `/builder` – Multi-step builder (Template → Add snippets → Arrange → Preview → Export/Save)
- `/tags/[tag]` – Tag landing (top/new items for tag, related tags)
- `/favorites` (authed) – Saved snippets/templates/files
- `/my/snippets`, `/my/templates`, `/my/files` – Owner dashboards (private/unlisted items)

## Landing page modules
1) Hero: value prop for agents.md reuse; CTAs: Start building, Browse library.
2) Featured carousel: staff picks across snippets/templates/files.
3) Trending grid: top copied/voted this week.
4) New this week: latest public items.
5) Tag cloud: top tags by frequency/recency.
6) “Most-copied agents.md” list with copy/download buttons.
7) How it works: 3-step illustration + builder CTA.
8) Social proof: vote counts/copies, maybe small avatars.

## Browse page layout
- Left rail filters: Type (Snippet/Template/File), Tags (multi-select), Tool/Model (if captured), Visibility=public only, Sort (Trending/New/Most copied/Top rated), Length maybe.
- Main content: grid/list cards with badges (New/Trending/Staff pick), stats (copies/views/votes), tags, quick Copy/Download + “Add to builder”.
- Sticky search bar at top with suggestions and keyboard shortcut (/).

## Detail pages
- Sticky header with title, tags, author, stats.
- Two-column: rendered markdown on left, raw code block on right (copy/download). Mobile: tabs Rendered/Raw.
- Actions: Copy, Download, Add to builder, Favorite (gated), Vote (gated), Comment thread (gated, below fold).
- Related content: “People also use”, same tags, same author.

## Builder flow (anonymous-friendly)
1) Pick template or start blank.
2) Add snippets from library (search + filters inline), or from favorites (authed).
3) Arrange/reorder (drag), edit inline overrides (local to build), and see live preview.
4) Export step: Copy to clipboard, Download `.md`; authed users can Save as Document (creates /files/[slug]).
5) If user triggers gated action while anon (favorite/save/vote), prompt inline modal and resume action post-login.

## Auth gating UX
- Inline toast or modal: “Sign in to save/favorite/comment. Your draft stays here.”
- Preserve context via `callbackUrl` and serialized pending action.
- Show lock badges on gated actions but leave browse/copy/download open.

## SEO/Sharing
- Canonical URLs per item; Open Graph image; meta description with first lines of markdown; sitemap for public items.

