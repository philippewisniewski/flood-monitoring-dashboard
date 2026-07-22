import type { SeverityLevel } from './types';

// Severity visual language — the one place colours are defined.
// 1 = Severe (red), 2 = Warning (amber), 3 = Alert (yellow), 4 = No longer in force (grey)
export const SEVERITY_CONFIG: Record<
    SeverityLevel,
    { label: string; color: string }
> = {
    1: { label: 'Severe Flood Warning', color: '#ef4444' },
    2: { label: 'Flood Warning', color: '#f59e0b' },
    3: { label: 'Flood Alert', color: '#eab308' },
    4: { label: 'Warning no longer in force', color: '#6b7280' },
};

// The API's data changes at most every 15 minutes (period: 900) and its CDN
// caches responses for 5 minutes (Cache-Control: max-age=300) — align with both.
export const API_REVALIDATE_SECONDS = 300;
export const LIVE_REFRESH_INTERVAL_MS = 15 * 60 * 1000;

// 24h of 15-minute readings for the station chart.
export const CHART_READINGS_LIMIT = 96;

// Geo-bridge: radius (km) around a flood-area centroid when resolving nearby stations.
export const STATION_SEARCH_DIST_KM = 25;
