# Search, Ranking, and Tag Clouds
Date: 2025-12-01  
Issue: markdowntown-7z8.5

## Objectives
- Fast, relevant search across Snippets/Templates/Documents with light infra (Postgres-first).
- Ranking modes: relevance, trending, top, most copied, new.
- Surface useful tag clouds for discovery without heavy compute.

## Recommended stack
- Postgres FTS (`tsvector` on title + content/description) with GIN indexes.
- Optional `pg_trgm` index on title/slug for short/fuzzy queries.
- Materialized views (or plain views + cached results) for trending scores.

## Ranking formulas
- **Relevance (default when q present):** `ts_rank_cd(tsv, plainto_tsquery(q)) * 0.7 + log1p(copies)*0.2 + freshness*0.1`.
- **Trending:** `0.5*log1p(copies_7d) + 0.25*log1p(votes_7d) + 0.15*log1p(views_7d) + 0.1*freshness_14d`.
- **Top:** `votes_lifetime` then `copies_lifetime`, tie-break by `updatedAt desc`.
- **Most copied:** `copies_lifetime desc`, tie-break `updatedAt desc`.
- **New:** `createdAt desc`.

## Queries (examples)
- Add generated column per table:  
  `tsv_title_content GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,''))) STORED;`  
  Index: `CREATE INDEX ON snippets USING GIN (tsv_title_content);`
- Search endpoint: filter by `type`, `tags` (array contains), `sort`; paginate with cursor on `id` or `createdAt`.
- Trending view: materialized view per type with precomputed score; refresh hourly/daily.

## Tag clouds
- Store tags as `text[]`; compute counts with:  
  `SELECT unnest(tags) AS tag, count(*) FROM snippets WHERE visibility='PUBLIC' GROUP BY tag ORDER BY count DESC LIMIT 50;`
- Trending tags: same query filtered to `updatedAt > now() - interval '14 days'`, weight by counts + recency decay.
- Keep counts in a cache/edge KV for 60s to avoid hot queries.

## API/UX guidance
- `GET /api/public/search`: accepts `q`, `type`, `tags`, `sort`, `page/cursor`.
- `GET /api/public/trending?type=snippet&limit=12`.
- `GET /api/public/tags?window=7d|30d` for tag clouds.
- Default sort: trending when no query; relevance when `q` present.
- Return lightweight stats (copies, votes, views) alongside results.

## Risks / mitigations
- FTS noise on short queries: fall back to trigram when `length(q) < 3`.
- MV refresh lag: acceptable for browse feeds; keep cache TTL short (60s) and invalidate on major stat changes if needed.
- Tag explosion: cap tags per item; normalize to lowercase; optionally add Tag table later for global uniqueness/autocomplete.
