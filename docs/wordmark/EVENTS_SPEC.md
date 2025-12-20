# Living City Wordmark Events Spec

## Objective
Define the event-to-visual mapping for the living city wordmark so site activity produces readable, delightful micro-animations without overwhelming the header.

## Event Channel
- Client dispatch: `dispatchCityWordmarkEvent` via `CITY_WORDMARK_EVENT` (see `src/components/wordmark/sim/events.ts`).
- Payload type: `CityWordmarkEvent` (see `src/components/wordmark/sim/types.ts`).

## Event Types and Reactions
### 1) search
- **Payload:** `{ type: "search", query: string }`
- **Visual Reaction:**
  - Spawn a short “scan” burst: 3-6 window lights flicker in the wordmark body.
  - Increase window intensity for 1–2 seconds.
- **Cadence:** Allow up to 1 reaction every 1.5s.

### 2) command_palette_open
- **Payload:** `{ type: "command_palette_open", origin?: string }`
- **Visual Reaction:**
  - Add a subtle “streetlight ripple”: 2–4 lights brighten sequentially left→right.
- **Cadence:** Allow up to 1 reaction every 2s.

### 3) publish
- **Payload:** `{ type: "publish", kind?: "artifact" | "template" | "snippet" | "file" }`
- **Visual Reaction:**
  - Spawn a “celebration” pedestrian/dog pair for 3–5 seconds.
  - Optional: 1–2 skyline windows blink twice.
- **Cadence:** Allow up to 1 reaction every 5s.

### 4) alert: ambulance
- **Payload:** `{ type: "alert", kind: "ambulance" }`
- **Visual Reaction:**
  - Spawn an ambulance actor with siren lights (existing behavior).
- **Cadence:** Allow up to 1 reaction every 8s.

## Rate Limiting and Concurrency
- Maintain an in-memory throttle per event type.
- Enforce a global max of 3 concurrent reactions to avoid UI noise.
- If a new event arrives while at capacity, drop it (no queue).
- Always allow an ambulance alert to preempt lower-priority reactions.

## Priority Order
1. ambulance alert
2. publish
3. command palette
4. search

## Performance Constraints
- All reactions must be deterministic and avoid per-frame allocations.
- Reactions should not add more than 120 extra rects per frame.

## Telemetry (Optional)
- If useful, log event counts client-side for tuning.
- Do not persist user-identifiable data in events.
