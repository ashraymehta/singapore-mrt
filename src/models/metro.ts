import {Line} from './line';

export class Metro {
    private readonly lines: Line[];

    constructor(lines: Line[]) {
        this.lines = lines;
    }
}