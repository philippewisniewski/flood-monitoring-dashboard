export interface ApiResponse<TData> {
    meta: {
        publisher: string;
        license: string;
        version: string;
    };
    items: TData[];
}

// severityLevel: 1 = Severe Flood Warning (Red), 2 = Flood Warning (Amber),
// 3 = Flood Alert (Yellow), 4 = Warning no Longer in Force (Grey)

export interface FloodAlert {
    id: string;
    description: string;
    eaAreaName: string;
    floodArea: {
        county: string;
        notation: string;
        polygon: string;
        riverOrSea?: string;
    };
    floodAreaID: string;
    isTidal: boolean;
    message?: string;
    severity: string;
    severityLevel: number;
    timeMessageChanged: string;
    timeRaised: string;
    timeSeverityChanged: string;
    status: string;
}

export interface FloodArea {
    id: string;
    label: string;
    areaName: string;
    county: string;
    riverOrSea: string;
    description: string;
    lat: number;
    long: number;
    polygon: string;
    fwdCode: string;
    quickDialNo: string;
}

export interface Station {
    id: string;
    RLOIid: string;
    label: string;
    catchmentName: string;
    riverName: string;
    town: string;
    lat: number;
    long: number;
    status: string;
    measures: MeasureSummary[];
}

export interface Measure {
    id: string;
    notation: string;
    label: string;
    stationReference: string;
    unitName: string;
    parameter: string;
    qualifier: string;
    latestReading: Reading;
}

export interface MeasureSummary {
    parameter: string;
    parameterName: string;
    period: number;
    qualifier: string;
    unitName: string;
}

export interface Reading {
    id?: string;
    dateTime: string;
    measure: string;
    value: number;
}

export interface StageScale {
    typicalRangeLow: number;
    typicalRangeHigh: number;
    highestRecent: { value: number; dateTime: string };
    maxOnRecord: { value: number; dateTime: string };
    minOnRecord: { value: number; dateTime: string };
}