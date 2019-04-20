import {Station} from './station';

export class LineStop {
    public readonly code: string;
    private readonly openingDate: Date;
    public readonly stoppingAt: Station;

    constructor(code: string, stoppingAt: Station, openingDate: Date) {
        this.code = code;
        this.stoppingAt = stoppingAt;
        this.openingDate = openingDate;
    }

    public isFor(station: Station): boolean {
        return this.stoppingAt === station;
    }
}