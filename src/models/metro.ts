import {Line} from './line';
import {Station} from './station';

export class Metro {
    private readonly lines: Line[];
    private readonly stations: Station[];

    constructor(lines: Line[], stations: Station[]) {
        this.lines = lines;
        this.stations = stations;
    }
}