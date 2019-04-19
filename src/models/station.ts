import {LineStop} from './line-stop';

export class Station {
    public readonly name: string;
    public readonly lineStops: LineStop[];

    constructor(name: string, lineStops: LineStop[]) {
        this.name = name;
        this.lineStops = lineStops;
    }
}