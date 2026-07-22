# FloodWatch — Development Tasks

My build checklist. Component contracts and rationale live in `design/DESIGN.md` —
read it before starting any task. Paper layout/component/state wireframes to finish
live in `design/WIREFRAMES.md` (design before code). Tick boxes as you go.

**Division of labour:** I build components and implement mappers myself (portfolio
piece). Agent scaffolds, reviews, and is on call for `lib/geo.ts` and the Recharts
band config — ask, don't struggle.

**Moving parts (the data pipeline):**
```
EA API → lib/api.ts (typed fetch, revalidate 300) → lib/mappers.ts (VMs)
       → components (props only, never raw API types)
Page state: activeWarningId · selectedStationId · panelMode
Live loop: changeWatcher + router.refresh() every 15 min (Phase 3)
Geo bridge: warning → floodArea centroid → nearby stations (Phase 2)
```

---

## Phase 1 — MVP: warnings feed + stations + chart

### Data layer
- [x] Define + refine API types (`src/lib/types.ts`)
- [ ] Implement mapper stubs in `src/lib/mappers.ts`
  - [ ] `normaliseWarningTimestamp` — append `Z` when missing; warnings lack it, readings have it
  - [ ] `toWarningVM` — `displayName = riverOrSea ?? eaAreaName`; `polygonCode = floodArea.notation`
  - [ ] `deriveTrend` — latest vs ~1h ago; <2 usable points → `'unknown'`
  - [ ] `deriveRangePosition` — vs typicalRange; missing inputs → `'unknown'`
  - [ ] `readingsToLevelPoints` — NaN-omitted → `null`; reverse to chronological
- [ ] Evolve `src/lib/api.ts` into typed domain helpers (keep my `getData`)
  - [ ] `getFloodWarnings(minSeverity = 4)` — 4 so "no longer in force" shows too
  - [ ] `getStationsNear(lat, long, dist)` — geo list (compact measures, NO latestReading)
  - [ ] `getStation(id)` — expanded measures WITH latestReading + stageScale (one call)
  - [ ] `getMeasureReadings(id, opts)` — `?_sorted&_limit=96` for 24h
  - [ ] Handle list vs single-item envelope (`items` array vs bare object)
  - [ ] Server-side fetches carry `{ next: { revalidate: 300 } }`
- [ ] Delete or keep `test.ts` (scratch) once the helpers are proven

### App shell
- [ ] Dark control-room layout: fixed grid regions, internal panel scrolling only
- [ ] Header: FloodWatch title, `● Live` indicator, `Updated HH:MM`, refresh affordance
- [ ] Footer: *"Uses Environment Agency flood and river level data from the real-time data API (Beta)"*

### Severity alerts (left rail)
- [ ] `SeverityAlertCard` — severityLevel colour (from `SEVERITY_CONFIG` ONLY),
  riverOrSea (fallback eaAreaName), severity label, TIDAL badge, timeRaised,
  timeSeverityChanged
- [ ] Feed — one card per warning, sorted severityLevel then latest change;
  quiet state ("no warnings in force" ≠ error)
- [ ] Click card → `activeWarningId` (selected state visible on card)

### Stations (right rail)
- [ ] `StationPanel` — context header slot (repeats warning `displayName` +
  severity colour token) OR search box; `panelMode: 'warning' | 'search'`
- [ ] `StationSearch` — direct client fetch `/id/stations?search=` (CORS open)
- [ ] `StationCard` collapsed — label, riverName/town, `{value} {unitName} {trend}`
  cluster (hydrates together, "…" slot, `unknown` trend = grey dot)
- [ ] `StationCard` expanded (lazy fetch on expand, skeleton inside body)
  - [ ] Header + status badge (Active | Suspended | Closed)
  - [ ] Readout Option A — hero `tabular-nums` + unit + trend; LOW|NORMAL|HIGH
    chip (colours ≠ severity colours); `as of` + typical range sub-line;
    "No current data" state
  - [ ] Measure switcher (Tabs, label = `qualifier`, only if >1, default "Stage")
  - [ ] Chart 24h — Recharts; **ask agent for band config**; y-domain = typical
    range; NaN gaps break line; latest-point dot; ~160–180px
  - [ ] Scale & identity — stat rows + identity line; hides without stageScale
- [ ] Behaviour: exclusive expand · new search collapses open card ·
  expand triggers detail fetches

### Wire-up
- [ ] Page state trio drives everything; props down, events up
- [ ] Verify against live API: `/id/floods?min-severity=4`, one station, one chart
- [ ] `npm run build` green · initial commit of scaffold + MVP

---

## Phase 2 — Map
- [ ] `FloodMap` (MapLibre GL, dark basemap) — client component, props from server
- [ ] Route Handler `/api/flood-areas/[id]/polygon` (revalidate 86400), centroid fallback
- [ ] `lib/geo.ts` bridge — **ask agent, this is the tricky one**:
  `floodArea.notation → centroid → stations?lat,long,dist=25`
- [ ] Warning polygon + station markers; single selected-station highlight; fly-to
- [ ] Polygon fetch failure → centroid marker fallback state

## Phase 3 — Live layer
- [ ] `use-live-refresh` hook — `router.refresh()` every 15 min
  (`LIVE_REFRESH_INTERVAL_MS`)
- [ ] Chart deltas via `?since={lastSeenDateTime}`
- [ ] changeWatcher: compare `timeSeverityChanged` / `timeMessageChanged` across
  refreshes → recolour + `NEW`/update badges (never hijack selection)
- [ ] Stale/degraded states: last-updated > 15 min → visible warning; API down →
  error + retry, cached data where possible

## Phase 4 — Polish
- [ ] Events feed (severity/message changes ticker) from changeWatcher
- [ ] Rainfall widget (stations?parameter=rainfall; 15-min mm bars)
- [ ] Range gauge readout (Option B) if still wanted
- [ ] States audit: every widget has loading / error / empty / stale
- [ ] README: architecture, WebSockets-rejection rationale, geo-bridge write-up,
  attribution, screenshots

---

### Standing rules (don't relearn these)
1. Components receive view models only — no raw API types past mappers.
2. Severity colours from `SEVERITY_CONFIG` only; badges/trends use other colours.
3. Value + unit + trend = one atomic cluster; never hardcode units.
4. `riverOrSea` ≠ `riverName` — never string-join; bridge geographically.
5. Freshness timestamps visible wherever a number is shown (`as of`).
