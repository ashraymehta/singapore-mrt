import {Lines} from './lines';

export class Metro {
    public readonly lines: Lines;

    constructor(lines: Lines) {
        this.lines = lines;
    }
}