import { ApiResponse } from "./types";

const baseUrl = "https://environment.data.gov.uk/flood-monitoring/"

export const api = {
    endpoints: {
        floods: `${baseUrl}id/floods`,
        floodAreas: `${baseUrl}id/floodAreas`,
        stations: `${baseUrl}id/stations`,
        latestReadings: `${baseUrl}data/readings/?latest`,
        measures: `${baseUrl}id/measures`,
        rainFall: `${baseUrl}data/readings?parameter=rainfall`,
    },

    async getData<TData>(url: string): Promise<ApiResponse<TData>> {
        try {
            const response = await fetch(url);
            // Add switch statement to handle different response statuses
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            throw error;
        }
    }
};