// Raw API types for the EA real-time flood monitoring API (Beta, v0.9).
// These mirror the JSON-LD responses faithfully — view models for the UI
// are derived from these in lib/mappers.ts.

export interface ApiResponse<TData> {
    '@context'?: string;
    meta: {
        publisher: string;
        license: string;
        version: string;
        // echoed back when paging modifiers are applied
        limit?: number;
        offset?: number;
        hasMore?: boolean;
    };
    items: TData[];
}

// severityLevel: 1 = Severe Flood Warning (Red), 2 = Flood Warning (Amber),
// 3 = Flood Alert (Yellow), 4 = Warning no Longer in Force (Grey)
export type SeverityLevel = 1 | 2 | 3 | 4;

export interface FloodAlert {
    '@id': string;
    description: string;
    eaAreaName: string;
    floodArea: {
        '@id': string;
        county: string;
        notation: string;
        polygon: string; // URI of the GeoJSON polygon resource
        riverOrSea?: string;
    };
    floodAreaID: string;
    isTidal: boolean;
    message?: string;
    severity: string;
    severityLevel: SeverityLevel;
    // NOTE: warning timestamps arrive WITHOUT a trailing Z — normalise in mappers
    timeMessageChanged: string;
    timeRaised: string;
    timeSeverityChanged: string;
}

export interface FloodArea {
    '@id': string;
    label: string;
    notation: string; // join key: === FloodAlert.floodAreaID, used in /id/floodAreas/{notation}
    county: string;
    riverOrSea?: string;
    description?: string;
    lat: number;
    long: number;
    polygon: string; // URI of the GeoJSON polygon resource (large — cache aggressively)
    fwdCode: string;
    quickDialNumber?: string;
    eaAreaName?: string;
}

export interface Station {
    '@id': string;
    notation: string; // === stationReference, used as {id} in /id/stations/{id}
    stationReference: string;
    label: string;
    // all of the following are genuinely optional in the wild
    // (rainfall stations are anonymised: no names, 100m-rounded coords)
    RLOIid?: string;
    catchmentName?: string;
    riverName?: string;
    town?: string;
    lat?: number;
    long?: number;
    status?: string; // URI, e.g. .../statusActive
    measures: MeasureSummary[];
}

export interface Measure {
    '@id': string;
    notation: string; // used as {id} in /id/measures/{id}
    label: string;
    stationReference: string;
    unitName: string;
    parameter: string;
    qualifier: string;
    period?: number; // seconds between readings, typically 900
    latestReading?: Reading; // absent for measures with no current data
}

export interface MeasureSummary {
    '@id': string; // join key: the measure URI, tail segment is the notation
    parameter: string;
    parameterName: string;
    period: number;
    qualifier: string;
    unitName: string;
}

export interface Reading {
    '@id'?: string;
    dateTime: string; // UTC, Z-suffixed
    measure: string; // URI of the parent measure
    value?: number; // OMITTED by the API when the reading is NaN — always handle
}

export interface StageScale {
    datum?: number;
    scaleMax?: number;
    typicalRangeLow: number;
    typicalRangeHigh: number;
    highestRecent?: { value: number; dateTime: string };
    maxOnRecord?: { value: number; dateTime: string };
    minOnRecord?: { value: number; dateTime: string };
}
