import {LineStop} from './line-stop';

export class Line {
    private readonly stops: LineStop[];

    constructor(stops: LineStop[]) {
        this.stops = stops;
    }
}