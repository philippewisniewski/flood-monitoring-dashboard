# FloodWatch — Design Context & Decisions Log

Handoff document capturing every agreed design decision. Read this first in any
new session before touching code. Companion artifacts: wireframes in Paper (MCP:
`paper`), Paper completion checklist in `design/WIREFRAMES.md`, code build list
in `design/TASKS.md`, API types in `src/lib/types.ts`, VM contracts in
`src/lib/mappers.ts`, visual/refresh constants in `src/lib/constants.ts`.

## 1. Vision

Single-page **control-room dashboard** (think NASA ops, wall-mounted 1080p) for the
EA real-time flood monitoring API (Beta, v0.9 — no auth, CORS open, 5-min CDN cache,
data updates ≤ every 15 min). Operator monitors incoming flood data nationally.
Dark theme, severity colour language everywhere, fits one screen, panels scroll
internally. Freshness is a first-class citizen (beta API, no SLA — degraded states
are features).

## 2. Layout — triptych

```
│ SEVERITY ALERTS │        MAP        │ STATIONS (search + expandable cards) │
```

Page-level state (only three values): `activeWarningId`, `selectedStationId`
(= the expanded station card), `panelMode: 'warning' | 'search'`.

## 3. Data architecture (decided)

- RSC fetch with `{ next: { revalidate: 300 } }` → serialisable props down to
  client leaves (map, chart, cards). Client components fetch directly for
  user-driven queries (CORS open).
- Heavy endpoints via Route Handlers: `/api/readings/latest` (~1.7 MB),
  `/api/flood-areas/[id]/polygon` (revalidate 86400).
- Live feel: client hook calling `router.refresh()` every 15 min
  (`LIVE_REFRESH_INTERVAL_MS`). **WebSockets considered and REJECTED** — upstream
  is REST-only and data can't change faster than 15 min; a WS server would poll
  and push deltas that don't exist. (Keep this rationale for the README.)
- React `use` complements but doesn't replace the above (no polling/invalidation).

## 4. Component contracts

### SeverityAlertCard (feed, left rail — one card per active warning)
Fields: `severityLevel` (colour keys off THIS), `riverOrSea` (fallback
`eaAreaName`), `severity`, `isTidal` (TIDAL badge), `timeRaised`,
`timeSeverityChanged`. Sorted by severityLevel then most recent change.
Card click → sets `activeWarningId` → drives map (polygon + fly-to) and
StationPanel via geo bridge. **changeWatcher** (external, grows into events feed):
on refresh compare timestamps — `timeSeverityChanged` bump = recolour + badge;
`timeMessageChanged` bump = badge only, colour stays.

### StationPanel (right rail)
Context header slot: selected warning's `displayName` repeated verbatim (this is
how operator knows stations ↔ alert — repetition + shared severity colour token,
NOT name-matching; stations never "belong" to alerts, relationship is proximity —
copy says "near"). Below: search box (`panelMode: 'search'` in quiet state),
then StationCards. **New search = collapse any expanded card.**

### StationCard — collapsed
`{label} — {riverName}/{town}` + atomic cluster `{value} {unitName} {trend}`
(hydrates together: geo list returns compact measures WITHOUT latestReading;
values hydrate per visible station from `/id/stations/{id}`, cached 5 min;
"…" loading slot; `unknown` trend = grey dot).

### StationCard — expanded (lazy: fetch getStation(id) + readings on expand)
1. **Header**: `{name}` `{riverName}` `{town}` + status badge (Active|Suspended|Closed)
2. **Current readout — OPTION A (chosen)**: hero number `text-4xl tabular-nums`
   + smaller muted unit + trend arrow; LOW|NORMAL|HIGH badge chip top-right;
   sub-line `"as of {latestReading.dateTime}" · typical range {low}–{high} {unit}`.
   Badge colours ≠ severity colours (above-typical ≠ flood warning!). Trend arrows
   neutral. States: skeleton / "No current data" / suspended-greyed.
3. **Measure switcher** (only if `measures.length > 1`): shadcn Tabs, label =
   `qualifier` (Stage / Downstream Stage / Tidal Level), NOT parameterName
   (always "Water Level"). Default: qualifier "Stage", else first. Switching
   re-renders readout AND chart.
4. **Chart — 24h** (Recharts): y-domain stretches to typicalRange band (NOT data),
   band = `ReferenceArea` ~5–8% opacity, line + latest-point dot w/ label,
   `null` (NaN) gaps = line breaks (`connectNulls={false}`), 3 x-ticks, ~160–180px
   high. No band when stageScale absent (rainfall) → domain falls back to data.
   maxOnRecord dashed line deferred to Phase 4.
5. **Scale & identity**: label/value stat rows (typical range, highest recent,
   max on record — each with dateTime), separator, identity line
   `{stationReference} · RLOI {RLOIid} ↗EA link · {catchmentName}`.
   Stats block hides when stageScale absent; identity always renders.

### Behavioural rules
Exclusive expand (one card open; `selectedStationId` stays single; map highlights
exactly one marker). Lazy-load detail on expand (never pay for unviewed detail).
New arrivals badge `NEW` — never hijack operator's current selection; auto-select
only if nothing selected.

## 5. Content model

API types ≠ UI types. Components consume ONLY view models from `lib/mappers.ts`
(`WarningVM`, `StationSummaryVM`, `StationDetailVM`, `LevelPoint`); derivations
live there too (`displayName`, `deriveTrend`, `deriveRangePosition`,
`readingsToLevelPoints`, `normaliseWarningTimestamp` — TODO stubs, user implements).

**Geo bridge** (`lib/geo.ts`, portfolio centrepiece): no warning→station link in
API; bridge geographically:
`flood.floodArea.notation → /id/floodAreas/{code} → lat/long centroid →
/id/stations?lat&long&dist=25 → measures → readings`.

## 6. API gotchas (verified against live API)

`value` OMITTED when NaN → `value?: number`, map to `null` in LevelPoint.
Warning timestamps lack `Z`; readings are UTC — normalise in mappers.
Stations: `lat/long/town/riverName/catchmentName/RLOIid/status` all optional;
rainfall stations anonymised (no names, 100m-rounded coords).
`riverOrSea` ≠ `riverName` — never string-join (different hierarchies; seas too).
Readings retained ~28 days. Flood warning URIs 404 ~24h after lapsing
(severity 4). Single-item endpoints return `items` as bare OBJECT not array
(getData needs list/single variants). `/id/3dayforecast` is dead (404).
Attribution required: "Uses Environment Agency flood and river level data from
the real-time data API (Beta)".

## 7. Decisions log

- shadcn/ui + Tailwind v4 · MapLibre GL · Recharts · plain fetch (no query lib)
- SeveritySummary ≠ KPI strip: per-warning cards; separate WarningList dissolved
  (redundant) — cards ARE the list; selection drives stations + map
- Two station regions merged into ONE accordion panel (layout simplification)
- Readout layout Option A chosen (hero + badge chip; B gauge = Phase 4 polish)
- MVP: warnings feed + stations + chart · Ph2 map · Ph3 live layer ·
  Ph4 polish (events feed, rainfall, range gauge, README)

## 8. Current state (as of 21 Jul 2026)

Phase 1 scaffold DONE: Next.js 16 (App Router, TS, src/, @/* alias), Tailwind v4,
shadcn init (button), maplibre-gl + recharts installed, `src/lib/{types,api,
mappers,constants,utils}.ts` in place, `test.ts` scratch at root, build passes.
Everything UNCOMMITTED — user reviews first. NEXT: user implements mappers stubs +
builds SeverityAlertCard against live `/id/floods?min-severity=4`. Agent on call
for `lib/geo.ts` + Recharts band config. Paper MCP connected for design critique.
