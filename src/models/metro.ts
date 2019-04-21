import {Line} from './line';
import {Lines} from './lines';
import {Stations} from './stations';

export class Metro {
    public readonly lines: Lines;
    // TODO: Consider if stations are really needed
    private readonly stations: Stations;

    constructor(lines: Line[] | Lines, stations: Stations) {
        this.lines = new Lines(lines);
        this.stations = stations;
    }
}