// Mappers: raw API types (lib/types.ts) -> view models consumed by components.
// Components should NEVER receive raw API shapes — only the view models below.
//
// Skeleton: the VM contracts are agreed (see design diagrams); the derivation
// logic is yours to implement. Each stub lists the rules we settled on.

import type {
    FloodAlert,
    Measure,
    Reading,
    SeverityLevel,
    Station,
} from './types';

// ---------------------------------------------------------------------------
// View models
// ---------------------------------------------------------------------------

/** One card in the SeveritySummary feed / one row's worth of warning context. */
export interface WarningVM {
    id: string; // from '@id'
    severityLevel: SeverityLevel;
    severityLabel: string; // e.g. "Flood Warning" (from `severity`, or SEVERITY_CONFIG)
    displayName: string; // riverOrSea ?? eaAreaName — repeated in the StationPanel context header
    county: string;
    isTidal: boolean;
    timeRaised: string; // ISO, normalised (warnings arrive WITHOUT trailing Z)
    timeSeverityChanged: string; // ISO, normalised
    message?: string;
    polygonCode: string; // floodArea.notation — used to fetch the GeoJSON polygon
}

/** Collapsed station card (StationPanel rows + map markers). */
export interface StationSummaryVM {
    id: string; // stationReference / notation — used in /id/stations/{id}
    name: string; // from `label`
    river?: string; // from `riverName`
    town?: string;
    lat?: number;
    long?: number;
    // The value/unit/trend cluster — hydrates together, null while loading
    // or when the station reports no current data:
    latestLevel?: number;
    unit?: string; // unitName of the measure the level came from — never hardcode
    trend: Trend;
}

/** Expanded station card body — lazy-loaded when the card opens. */
export interface StationDetailVM {
    summary: StationSummaryVM;
    status: 'active' | 'suspended' | 'closed' | 'unknown'; // parsed from status URI
    catchmentName?: string;
    stationReference: string;
    rloiId?: string; // RLOIid — link out to EA river-levels page
    typicalRange?: { low: number; high: number }; // absent on e.g. rainfall stations
    highestRecent?: { value: number; dateTime: string };
    maxOnRecord?: { value: number; dateTime: string };
    measures: Measure[]; // for the measure switcher (default: qualifier "Stage", else first)
    rangePosition: RangePosition; // LOW | NORMAL | HIGH — derived, see below
    asOf?: string; // latestReading.dateTime — the freshness timestamp
}

/** One point on the 24h chart. `value: null` = API omitted it (NaN) = line break. */
export interface LevelPoint {
    t: string; // ISO dateTime
    value: number | null;
}

export type Trend = 'rising' | 'falling' | 'steady' | 'unknown';
export type RangePosition = 'low' | 'normal' | 'high' | 'unknown';

// ---------------------------------------------------------------------------
// Derivations (TODO: implement)
// ---------------------------------------------------------------------------

/** Warnings arrive without a trailing Z; readings are UTC with Z. Normalise to ISO. */
export function normaliseWarningTimestamp(ts: string): string {
    // TODO: append 'Z' if no timezone suffix present, return new Date(ts).toISOString()
    throw new Error('not implemented');
}

export function toWarningVM(alert: FloodAlert): WarningVM {
    // TODO: map fields; displayName = floodArea.riverOrSea ?? eaAreaName;
    // polygonCode = floodArea.notation; normalise both timestamps.
    throw new Error('not implemented');
}

/**
 * Trend from a readings series (e.g. last ~2h, `_sorted&_limit=8`).
 * delta = latest − value ~1h ago; |delta| below threshold => 'steady';
 * fewer than 2 usable points (watch for omitted values) => 'unknown'.
 */
export function deriveTrend(readings: Reading[]): Trend {
    // TODO: implement
    throw new Error('not implemented');
}

/** Position of the current level vs the typical range band. */
export function deriveRangePosition(
    value: number | undefined,
    range: { low: number; high: number } | undefined,
): RangePosition {
    // TODO: below low => 'low', above high => 'high', inside => 'normal',
    // missing inputs => 'unknown'
    throw new Error('not implemented');
}

/**
 * API returns newest-first when `_sorted`; the chart wants chronological order.
 * Map omitted values (NaN) to null so the chart line breaks at gaps.
 */
export function readingsToLevelPoints(readings: Reading[]): LevelPoint[] {
    // TODO: map { t: dateTime, value: value ?? null } and reverse
    throw new Error('not implemented');
}
