import {Line} from './line';
import {Stations} from './stations';

export class Metro {
    private readonly lines: Line[];
    private readonly stations: Stations;

    constructor(lines: Line[], stations: Stations) {
        this.lines = lines;
        this.stations = stations;
    }
}