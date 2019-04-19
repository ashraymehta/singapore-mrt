import {LineStop} from './line-stop';

export class Line {
    public readonly stops: LineStop[];

    constructor(stops: LineStop[]) {
        this.stops = stops;
    }
}