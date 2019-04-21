import {Line} from './line';
import {Lines} from './lines';

export class Metro {
    public readonly lines: Lines;

    constructor(lines: Line[] | Lines) {
        this.lines = new Lines(lines);
    }
}