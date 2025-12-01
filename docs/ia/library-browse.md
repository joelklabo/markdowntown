# Library Browse Page (Filters, Search, Quick Copy)
Date: 2025-12-01  
Issue: markdowntown-7z8.26

## Requirements
- Public browse of Snippets/Templates/Documents with filters and sorts (Trending/New/Top/Most copied).
- Quick actions on cards: Copy (snippets), Use template, Add to builder, Download (documents).
- Responsive grid/list with fast search and tag filtering.

## Layout
- Top bar: search input (⌘/) + sort tabs (Trending, New, Most copied, Top rated) + type filter pills (All, Snippets, Templates, Files).
- Left rail (desktop) / sheet (mobile): tag multi-select, tool/model filter (future), visibility = public only, reset filters.
- Results: cards with title, badges (New/Trending/Staff Pick), stats (copies/views/votes), tags, type icon, actions (Copy/Use/Add/Download).
- Pagination or “Load more” infinite scroll; preserve filters in URL.

## Data wiring
- Use public search API (`/api/public/search`) with params: `q`, `type`, `tags`, `sort`, `page/cursor`.
- Default to trending feed when `q` empty; fall back to list endpoints if search down.
- Tag pills sourced from tag cloud endpoint.

## Performance
- Debounce search input; optimistic UI for filters.
- Cache initial data with ISR; client uses SWR for revalidation.
- Skeletons while loading; keep interactions usable during fetch.

## Checklist
- [ ] Implement filter state synced to query params.
- [ ] Hook search + sort + type filters to `/api/public/search`.
- [ ] Render card actions (Copy/Use/Add/Download) with correct targets.
- [ ] Handle empty states and error fallback.
- [ ] Mobile filter sheet; desktop left rail with sticky position.
- [ ] Analytics: track filter changes, copy/use/add clicks.
