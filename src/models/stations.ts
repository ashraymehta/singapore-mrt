import {Station} from './station';
import {LineStop} from './line-stop';

export class Stations extends Set<Station> {
    public findStationWithName(name: string): Station {
        return [...this].find(s => s.name === name);
    }

    public createOrUpdate(stationName: string, lineStop: LineStop): void {
        const existingStation = this.findStationWithName(stationName);
        if (existingStation) {
            existingStation.addStop(lineStop);
        } else {
            this.add(new Station(stationName, [lineStop]));
        }
    }
}