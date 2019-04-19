import {Station} from './station';

export class Stations extends Set<Station> {
    public findStationWithName(name: string): Station {
        return [...this].find(s => s.name === name);
    }
}