import {Station} from './station';

export class LineStop {
    public readonly code: string;
    public readonly stoppingAt: Station;
    private readonly openingDate: Date;

    constructor(code: string, stoppingAt: Station, openingDate: Date) {
        this.code = code;
        this.stoppingAt = stoppingAt;
        this.openingDate = openingDate;
    }

    public isFor(station: Station): boolean {
        return this.stoppingAt === station;
    }

    public wasOpenedOnOrBefore(queryDate: Date): boolean {
        return this.openingDate <= queryDate;
    }
}