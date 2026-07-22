import { api } from '@/lib/api';
import type { Station, FloodArea, FloodAlert, Measure, Reading } from '@/lib/types';

async function main() {
    const { items: stations } = await api.getData<Station>(api.endpoints.stations);
    console.log(stations[0].measures)
    const { items: floodAreas } = await api.getData<FloodArea>(api.endpoints.floodAreas);
    const { items: measures } = await api.getData<Measure>(api.endpoints.measures);
    const { items: latest } = await api.getData<Reading>(api.endpoints.latestReadings);
    const { items: floodAlerts } = await api.getData<FloodAlert>(api.endpoints.floods);
    const { items: rainfall } = await api.getData<Reading>(api.endpoints.rainFall);
}

main();