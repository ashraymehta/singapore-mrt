import {first} from 'lodash';
import {Station} from './station';
import {LineStop} from './line-stop';

export class Line {
    public static readonly LineCodeLength = 2;
    public readonly stops: LineStop[];
    private timeTakenBetweenStations: number = 1;

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
        return this.timeTakenBetweenStations;
    }

    public setTimeTakenBetweenStations(time: number): void {
        this.timeTakenBetweenStations = time;
    }

    public code() {
        return first(this.stops).code.substr(0, Line.LineCodeLength);
    }
}