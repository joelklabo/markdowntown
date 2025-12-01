# Data Model Research: Snippets, Templates, Documents
Date: 2025-12-01  
Issue: markdowntown-7z8.4

## Questions to answer
- How to keep Snippet (single markdown block) distinct from Template (has placeholders) and Document (ordered bundle)?
- How to track stats + moderation without bloating hot rows?
- How to make tags/slug uniqueness work for public + user-private scopes?

## Conclusions
- **Snippet vs Template vs Document:** keep three first-class tables. Templates store `fields` JSON schema; Documents are ordered collections via join table with per-item overrides.
- **Visibility & ownership:** `visibility` enum (public|unlisted|private) on all three; `userId` nullable for seeds/public defaults. Slugs unique per table; allow same slug in private scope if `userId` differs (partial unique index on (slug, coalesce(userId,''), visibility != 'private')).
- **Stats model:** store counters on entity rows (views, copies, downloads, votesUp/Down, favoritesCount, commentsCount). Append raw events to `Event` table for rollups/trending; refresh MVs daily/hourly.
- **Engagement tables:** `Vote`, `Favorite`, `Comment` polymorphic via `targetType/targetId` with indexes on `(targetType, targetId)` and `(userId, targetType)`.
- **Tags:** start with string[] on each entity for simplicity; optional normalized `Tag` + join if we need global counts/autocomplete.
- **Ordering in documents:** `DocumentSnippet { documentId, snippetId, position, overrides (jsonb) }`; enforce unique (documentId, position) and (documentId, snippetId).
- **Search:** add generated `tsvector` columns per entity and GIN indexes; optional trigram on title for fuzzy.

## Migration sketch (from current Section)
1) Rename `Section` → `Snippet`; add `slug`, `visibility`, `tags`, `kind`, stats counters.
2) Create `Template`, `Document`, `DocumentSnippet`, `Vote`, `Favorite`, `Comment`, `Event` tables.
3) Backfill slugs from titles; set visibility=private for existing rows; kind default `freeform`.
4) Seed a handful of public snippets/templates for launch; mark `public_library` flag to gate exposure.

## Edge cases / risks
- Cache invalidation must key on slug + visibility; avoid leaking private content through public caches.
- Polymorphic engagement tables can grow fast—partition Event by month if volume spikes.
- Ensure comment body and template fields are sanitized to avoid XSS in rendered markdown/export.
