import {Station} from './station';

export class LineStop {
    public readonly code: string;
    private readonly openingDate: Date;
    private readonly stoppingAt: Station;

    constructor(code: string, stoppingAt: Station, openingDate: Date) {
        this.code = code;
        this.stoppingAt = stoppingAt;
        this.openingDate = openingDate;
    }
}