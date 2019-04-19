import {LineStop} from './line-stop';

export class Line {
    public readonly stops: LineStop[];
    public static readonly LineCodeLength = 2;

    constructor(stops: LineStop[]) {
        this.stops = stops;
    }
}