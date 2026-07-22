# FloodWatch — Wireframe Checklist (Paper)

Working checklist for **layout, components, component states, widgets, map, and charts** in Paper. Companion to `DESIGN.md` (contracts/rationale) and `TASKS.md` (code build). Tick boxes as artboards land; keep names aligned with Paper layer names where possible.

**Target canvas:** control-room, dark theme, ~1440×900 (or 1920×1080 wall) — one screen, panels scroll internally.

**Status legend**

| Mark | Meaning |
|------|---------|
| Done | Artboard exists and matches contract well enough to build from |
| Partial | Artboard exists but missing regions, chrome, or key states |
| Todo | Not yet wireframed (or empty stub only) |
| Later | Phase 3–4 polish — wireframe only if useful before code |

**Paper snapshot (as of this file):** Colours · Dashboard (rails only) · stationCardExpanded · stationCardExpanded · Downstream · stationCardCollapsed · LevelChart · stationPanel · warning · stationPanel · search · stationCard · states (title stub).

---

## 0. Inventory — existing artboards

| Artboard (Paper) | Status | Finish remaining |
|------------------|--------|------------------|
| Colours | Done | Optional: label each swatch with role (`severity-1` … `severity-4`, range chip, trend, map accent, surface) |
| Dashboard | Partial | Add header, map column, footer; wire selected/quiet variants (see §1) |
| stationCardExpanded | Done | Cross-check against expanded state matrix (§3.2); add missing states as separate boards or a strip |
| stationCardExpanded · Downstream | Done | Keep as measure-switcher reference |
| stationCardCollapsed | Done | Use as default happy path; remaining variants go on `stationCard · states` |
| LevelChart | Done | Add no-band / gap / empty / loading variants (§5) |
| stationPanel · warning | Done | Ensure one card shows **full** expand (tabs + chart + identity) vs readout-only |
| stationPanel · search | Done | Optional: loading results + error search states |
| stationCard · states | Todo | Entire strip is empty — fill (§3.1) |

---

## 1. App shell & full-page layouts

Fixed grid: **header · triptych (alerts \| map \| stations) · footer**. Only three page states: `activeWarningId`, `selectedStationId`, `panelMode`.

| # | Artboard / view | Status | What to show | Notes from DESIGN |
|---|-----------------|--------|--------------|-------------------|
| 1.1 | **Dashboard · default (warning selected)** | Partial | Full shell: header + left feed (one card selected) + map (polygon + markers) + right panel in warning mode (context header, one expanded station, rest collapsed) + footer | Primary build target; map currently missing |
| 1.2 | **Dashboard · quiet (no warning selected)** | Todo | Same shell; left feed empty/quiet copy; map national/default view; right panel search mode | `panelMode: 'search'` |
| 1.3 | **Dashboard · no warnings in force** | Todo | Left rail quiet state (not an error); map idle; stations searchable | Empty ≠ error |
| 1.4 | **Dashboard · API / stale degraded** | Later | Header stale badge; rails show last-known + retry; map dimmed or last polygon | Phase 3 freshness |
| 1.5 | **Header** (component or region) | Todo | `FloodWatch` title · `● Live` · `Updated HH:MM` · refresh affordance | App shell task |
| 1.6 | **Header · stale / offline** | Later | Live → Stale / Offline; last success time; retry | Phase 3 |
| 1.7 | **Footer** | Todo | EA attribution string (required) | Exact copy in DESIGN §6 |
| 1.8 | **Grid annotations** | Todo (optional) | Column widths, scroll regions, z-order of map under rails | Helps implementation |

### 1.A Header fields checklist

| Element | Status | Spec |
|---------|--------|------|
| Product title “FloodWatch” | Todo | Primary identity |
| Live indicator (`● Live`) | Todo | Green/phosphor pulse when fresh |
| Last updated `Updated HH:MM` | Todo | From last successful refresh |
| Manual refresh control | Todo | Icon or text button |
| Stale warning (>15 min) | Later | Distinct from Live |
| Offline / error chip | Later | With retry |

### 1.B Footer fields checklist

| Element | Status | Spec |
|---------|--------|------|
| Attribution line | Todo | *Uses Environment Agency flood and river level data from the real-time data API (Beta)* |

---

## 2. Severity alerts (left rail)

### 2.1 SeverityAlertCard — anatomy (happy path)

Already sketched inside Dashboard; lock the field list.

| Element | Status | Spec |
|---------|--------|------|
| Severity colour treatment | Partial | From `SEVERITY_CONFIG` only (level 1–4) — never invent extra severity hues |
| Severity label | Partial | e.g. Flood Warning / Severe / Alert / No longer in force |
| Display name | Partial | `riverOrSea ?? eaAreaName` |
| County / secondary line | Partial | If shown, keep subordinate to display name |
| TIDAL badge | Todo | Only when `isTidal` |
| `timeRaised` | Partial | Normalised ISO → display time |
| `timeSeverityChanged` | Partial | Show when useful for operator |
| Selected ring / fill | Todo | Driven by `activeWarningId` |
| Unselected default | Partial | Default card in feed |
| Message teaser (optional) | Todo | If space; full message not required on card |

### 2.2 SeverityAlertCard — state strip (new artboard recommended)

| # | State | Status | Visual intent |
|---|-------|--------|---------------|
| 2.2.1 | Severity 1 — Severe | Todo | Red token |
| 2.2.2 | Severity 2 — Warning | Partial | Amber (exists on Dashboard) |
| 2.2.3 | Severity 3 — Alert | Todo | Yellow token |
| 2.2.4 | Severity 4 — No longer in force | Todo | Grey token |
| 2.2.5 | Selected | Todo | Clear selection chrome (left rail selection drives map + stations) |
| 2.2.6 | TIDAL | Todo | Badge only; colour still from severityLevel |
| 2.2.7 | NEW (arrived this refresh) | Later | Badge; **do not** auto-hijack selection if something already selected |
| 2.2.8 | Updated — severity changed | Later | Recolour + badge (`timeSeverityChanged` bump) |
| 2.2.9 | Updated — message only | Later | Badge only; colour unchanged (`timeMessageChanged`) |
| 2.2.10 | Skeleton / loading card | Todo | Feed hydrating |
| 2.2.11 | Focus / hover (optional) | Todo | Keyboard/ops affordance if you care |

### 2.3 Severity feed (list container)

| # | View | Status | Spec |
|---|------|--------|------|
| 2.3.1 | Populated feed | Partial | Sorted by severityLevel, then most recent change; internal scroll |
| 2.3.2 | Quiet — no warnings in force | Todo | Calm empty copy ≠ error |
| 2.3.3 | Loading feed | Todo | Multiple skeleton cards |
| 2.3.4 | Error + retry | Todo | Failed `/id/floods` fetch |
| 2.3.5 | Mixed severities (1–4) | Todo | Proves colour language + sort order |

---

## 3. Stations (right rail)

### 3.1 StationCard — collapsed states

**Artboard:** `stationCard · states` (currently empty). Default happy path already on `stationCardCollapsed`.

| # | State | Status | Spec |
|---|-------|--------|------|
| 3.1.1 | Default hydrated | Done | `{label}` + river/town + `{value} {unit} {trend}` atomic cluster |
| 3.1.2 | Loading levels (`…`) | Todo | Geo list has no latestReading; hydrate slot shows ellipsis until values arrive |
| 3.1.3 | No current data | Todo | Cluster empty / “—” ; not an error |
| 3.1.4 | Trend rising | Todo | Neutral arrow (not severity colour) |
| 3.1.5 | Trend falling | Todo | Neutral arrow |
| 3.1.6 | Trend steady | Todo | Neutral indicator |
| 3.1.7 | Trend unknown | Todo | Grey dot |
| 3.1.8 | Selected / expanded chrome (collapsed peer) | Todo | Other cards stay collapsed; only one open |
| 3.1.9 | NEW station in list | Later | Badge; don’t steal expand selection |
| 3.1.10 | Missing river / town | Todo | Optional fields — layout must not collapse awkwardly |
| 3.1.11 | Rainfall / anonymised station | Later | Sparse label; still show unit cluster if present |

### 3.2 StationCard — expanded states

**Base:** `stationCardExpanded` + Downstream variant. Add a **state strip** or named variants for the rest.

| # | State / region | Status | Spec |
|---|----------------|--------|------|
| 3.2.1 | Header + Active badge | Done | name, river, town, status |
| 3.2.2 | Status Suspended | Todo | Greyed treatment |
| 3.2.3 | Status Closed | Todo | Greyed / distinct from suspended |
| 3.2.4 | Status unknown | Todo | Parsed status missing |
| 3.2.5 | Readout Option A — NORMAL | Done | Hero + unit + trend + range chip |
| 3.2.6 | Readout — LOW chip | Todo | Chip colours ≠ severity palette |
| 3.2.7 | Readout — HIGH chip | Todo | Chip colours ≠ severity palette |
| 3.2.8 | Readout — range unknown | Todo | No stageScale / missing value |
| 3.2.9 | Readout skeleton | Todo | Lazy expand loading body |
| 3.2.10 | Readout “No current data” | Todo | Explicit empty state |
| 3.2.11 | Suspended greyed readout | Todo | Whole expanded body muted |
| 3.2.12 | Measure switcher — multi (Stage selected) | Done | Tabs = `qualifier` only |
| 3.2.13 | Measure switcher — Downstream selected | Done | Separate board |
| 3.2.14 | Measure switcher — Tidal Level | Todo | Third qualifier example |
| 3.2.15 | Measure switcher hidden (single measure) | Todo | Tabs omit when `measures.length === 1` |
| 3.2.16 | Chart 24h with typical band | Done | See §5 |
| 3.2.17 | Chart without band (no stageScale) | Todo | Domain from data; stats block hidden |
| 3.2.18 | Scale & identity block | Done | typical / highest recent / max on record + identity line |
| 3.2.19 | Identity only (no stageScale stats) | Todo | Stats hide; identity always shows |
| 3.2.20 | Expand error + retry | Todo | getStation / readings failed inside card |

### 3.3 StationPanel

| # | View | Status | Spec |
|---|------|--------|------|
| 3.3.1 | Warning mode — context header | Done | “Stations near” + warning `displayName` + severity chip; copy implies proximity not ownership |
| 3.3.2 | Warning mode — list + one fully expanded | Partial | Confirm expanded card includes tabs + chart + identity (not readout-only) |
| 3.3.3 | Warning mode — all collapsed | Todo | Selection on map only / nothing expanded |
| 3.3.4 | Warning mode — loading nearby stations | Todo | After alert click, geo bridge in flight |
| 3.3.5 | Warning mode — zero stations in 25 km | Todo | Empty copy; still allow search |
| 3.3.6 | Search mode — quiet header | Done | No warning selected copy |
| 3.3.7 | Search mode — query + results | Done | e.g. “wrox”; “new search collapses card” rule visible |
| 3.3.8 | Search mode — no matches | Partial | Empty hint exists; polish if needed |
| 3.3.9 | Search mode — loading | Todo | In-flight national search |
| 3.3.10 | Search mode — error | Todo | Fetch failure |
| 3.3.11 | List meta row | Done | Count + behavioural rule captions (can stay as design annotations) |

### 3.4 StationSearch (control)

| Element | Status | Spec |
|---------|--------|------|
| Placeholder idle | Done | “Search stations…” |
| Active query | Done | Typed query + caret |
| Clear control (optional) | Todo | If you want one-click clear |
| Disabled while expanding (optional) | Todo | Only if behaviour needs it |

---

## 4. Map (`FloodMap`)

No dedicated map artboard yet — highest-impact gap for the triptych.

| # | View / layer | Status | Spec |
|---|--------------|--------|------|
| 4.1 | **Map · idle / national** | Todo | Dark basemap; no warning polygon; optional UK framing |
| 4.2 | **Map · warning selected** | Todo | Flood-area polygon filled with severity colour (low opacity); fly-to |
| 4.3 | **Map · stations near warning** | Todo | Markers for geo-bridged stations within 25 km |
| 4.4 | **Map · selected station highlight** | Todo | Exactly one emphasized marker (`selectedStationId`) |
| 4.5 | **Map · centroid fallback** | Todo | Polygon fetch failed → pin at floodArea lat/long |
| 4.6 | **Map · loading polygon** | Todo | Subtle loading on map chrome or polygon shimmer |
| 4.7 | **Map · no stations** | Todo | Polygon only; empty right rail coordinated |
| 4.8 | **Map legend / chrome** (optional) | Todo | Minimal — severity swatch, marker key; avoid clutter |
| 4.9 | **Map tooltip / popup** (optional) | Todo | Station name + latest level on hover/click |
| 4.10 | **Map · stale / error overlay** | Later | Phase 3 degraded |

### 4.A Map interaction notes (annotate on artboard)

| Interaction | Wireframe note |
|-------------|----------------|
| Click severity card | Fly-to + polygon + repopulate station markers |
| Click station marker | Sets `selectedStationId` → expands card in right rail |
| Click map empty | Optional deselect — decide and document |
| Scroll / zoom | Panels fixed; map is the flexible centre |

---

## 5. Charts & readouts

### 5.1 LevelChart (24h water level)

**Base board:** `LevelChart` — good happy path with annotations.

| # | Variant | Status | Spec |
|---|---------|--------|------|
| 5.1.1 | Typical band + line + latest dot | Done | y-domain = typical range; band ~5–8% opacity; 3 x-ticks; ~160–180px |
| 5.1.2 | NaN gap (line break) | Done | `connectNulls={false}`; gap annotation ok for designers |
| 5.1.3 | No stageScale (no band) | Todo | Domain from data min/max; no ReferenceArea |
| 5.1.4 | Loading skeleton | Todo | Expand-in-progress |
| 5.1.5 | Empty / no readings | Todo | Explicit empty, not a flat zero line |
| 5.1.6 | Single point / sparse | Todo | Still show latest; trend unknown |
| 5.1.7 | Rising series | Todo | Optional — proves line direction |
| 5.1.8 | Falling / flood peak | Todo | Optional narrative example |
| 5.1.9 | Unit label in chrome | Partial | e.g. mASD in corner — keep consistent with readout |
| 5.1.10 | maxOnRecord dashed line | Later | Phase 4 — do not block MVP |

### 5.2 Current readout (Option A) — standalone if useful

| # | Variant | Status | Spec |
|---|---------|--------|------|
| 5.2.1 | Hero + unit + trend + NORMAL | Done | Inside expanded card |
| 5.2.2 | LOW / HIGH / unknown | Todo | See §3.2 |
| 5.2.3 | No data / skeleton | Todo | See §3.2 |
| 5.2.4 | Option B range gauge | Later | Phase 4 polish only if still wanted |

### 5.3 Rainfall chart / widget

| # | Variant | Status | Spec |
|---|---------|--------|------|
| 5.3.1 | 15-min mm bar chart | Later | Phase 4; `parameter=rainfall` |
| 5.3.2 | Empty / no rain | Later | |
| 5.3.3 | Loading | Later | |

---

## 6. Widgets & secondary UI (Phase 3–4)

Wireframe when ready; don’t block MVP triptych.

| # | Widget | Status | Spec |
|---|--------|--------|------|
| 6.1 | **Events feed / ticker** | Later | From changeWatcher: severity/message changes; NEW/update badges |
| 6.2 | **Events feed · empty** | Later | Quiet period |
| 6.3 | **Live refresh toast / flash** (optional) | Later | Subtle “refreshed” without stealing focus |
| 6.4 | **Rainfall widget** | Later | Compact bars; may live in expanded card or side module |
| 6.5 | **Range gauge (Option B)** | Later | Alternative readout |
| 6.6 | **Degraded banner** | Later | Global API-down / stale strip under header |

---

## 7. Cross-cutting state matrix

Every major surface should eventually hit these four (MVP prioritise bold).

| Surface | Loading | Empty | Error | Stale |
|---------|---------|-------|-------|-------|
| App header | — | — | **Offline chip** | **>15 min** |
| Severity feed | **Skeleton cards** | **No warnings in force** | **Retry** | Later |
| Severity card | Skeleton | — | — | NEW/update badges (Later) |
| Station panel | **Nearby loading** | **0 stations / no matches** | **Search error** | Later |
| Station card collapsed | **`…` hydrate** | **No current data** | — | Later |
| Station card expanded | **Body skeleton** | **No current data** | **Retry in card** | Later |
| LevelChart | **Skeleton** | **No readings** | With card error | Later |
| Map | **Polygon loading** | Idle national | **Centroid fallback** | Later |

---

## 8. Suggested Paper artboard set (to finish)

Use this as a build order. Rename freely; keep one concept per artboard when possible.

### P0 — complete the control-room story

| Order | Artboard name | Purpose |
|------:|---------------|---------|
| 1 | `Dashboard · warning selected` | Full triptych + header + footer |
| 2 | `FloodMap · warning + stations` | Polygon, markers, selected marker, dark basemap |
| 3 | `Header` + `Footer` | Or draw only inside Dashboard if you prefer fewer boards |
| 4 | `stationCard · states` | Collapsed matrix (§3.1) |
| 5 | `SeverityAlertCard · states` | Levels 1–4, selected, TIDAL, skeleton |
| 6 | `Severity feed · quiet` | Empty left rail |

### P1 — operator edge cases (still MVP-relevant)

| Order | Artboard name | Purpose |
|------:|---------------|---------|
| 7 | `Dashboard · quiet / search` | No `activeWarningId` |
| 8 | `stationCardExpanded · states` | Skeleton, no data, suspended, LOW/HIGH, single-measure |
| 9 | `LevelChart · variants` | No band, empty, loading, sparse |
| 10 | `FloodMap · centroid fallback` | Polygon failure |
| 11 | `StationPanel · loading / empty nearby` | Geo bridge in flight + 0 results |

### P2 — live + polish (align with TASKS Phases 3–4)

| Order | Artboard name | Purpose |
|------:|---------------|---------|
| 12 | `Header · stale / offline` | Freshness language |
| 13 | `SeverityAlertCard · NEW / updated` | changeWatcher badges |
| 14 | `Events feed` | Ticker |
| 15 | `Rainfall widget` | Bars |
| 16 | `Readout · range gauge (Option B)` | Optional |

---

## 9. Colour & token notes (for wireframes)

| Role | Source | Rule |
|------|--------|------|
| Severity 1–4 | `SEVERITY_CONFIG` / Colours board | **Only** place severity hues are defined |
| Range chips LOW/NORMAL/HIGH | Separate from severity | Above-typical ≠ flood warning |
| Trend arrows / unknown dot | Neutral greys | Never severity red/amber |
| Map polygon fill | Severity of active warning | Low opacity over dark basemap |
| Surfaces | Dark control-room | Rails scroll; map is the “void” centre |

Optional Paper task: extend **Colours** with labeled roles (severity, range, trend, surface, border, text primary/muted, map water/land).

---

## 10. Definition of done (wireframes)

A component/view is **wireframe-done** when:

1. Happy path matches `DESIGN.md` field list (no mystery labels).
2. Loading, empty, and error (where applicable) are drawn or explicitly deferred to Later.
3. Severity vs non-severity colour use is unambiguous.
4. Interaction notes that affect layout (selection, exclusive expand, fly-to) are annotated on the board or in this file.
5. Dashboard shows the full triptych once — not only isolated components.

Code implementation stays on `TASKS.md`; this file is **Paper-only**.

---

## 11. Progress log

| Date | Done | Next |
|------|------|------|
| 2026-07-22 | Checklist created from DESIGN + Paper inventory | P0: Dashboard triptych + map + card/alert state strips |

_(Add a row when you finish a P0/P1 board.)_
