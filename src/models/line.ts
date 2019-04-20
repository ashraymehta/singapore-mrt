import {Station} from './station';
import {LineStop} from './line-stop';

export class Line {
    public readonly stops: LineStop[];
    public static readonly LineCodeLength = 2;

    constructor(stops: LineStop[]) {
        this.stops = stops;
    }

    public stopsAt(station: Station): boolean {
        return !!this.findStopFor(station);
    }

    public findStopFor(station: Station): LineStop {
        return this.stops.find(stop => stop.isFor(station));
    }
}