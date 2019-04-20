import {Station} from './station';
import {LineStop} from './line-stop';

export class Line {
    public static readonly LineCodeLength = 2;
    public readonly stops: LineStop[];

    constructor(stops: LineStop[]) {
        this.stops = stops;
    }

    public stopsAt(station: Station): boolean {
        return !!this.findStopFor(station);
    }

    public hasStop(lineStop: LineStop): boolean {
        return !!this.stops.find(stop => stop === lineStop);
    }

    public findStopFor(station: Station): LineStop {
        return this.stops.find(stop => stop.isFor(station));
    }

    public getTimeTakenBetweenStations(): number {
        return 1;
    }
}