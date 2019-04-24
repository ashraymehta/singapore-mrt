import {uniqueId} from 'lodash';
import {Station} from '../../src/models/station';
import {LineStop} from '../../src/models/line-stop';

export class LineStopBuilder {
    private code: string;
    private station: Station;
    private openingDate: Date;

    private constructor() {
    }

    public static withDefaults(): LineStopBuilder {
        const identifier = uniqueId();
        return new LineStopBuilder()
            .withCode(`CC${identifier}`)
            .stoppingAt(new Station(`A Station - ${identifier}`))
            .withOpeningDate(new Date(2019, 0, 1));
    }

    public withCode(code: string): this {
        this.code = code;
        return this;
    }

    public stoppingAt(station: Station): this {
        this.station = station;
        return this;
    }

    public withOpeningDate(openingDate: Date): this {
        this.openingDate = openingDate;
        return this;
    }

    public build(): LineStop {
        return new LineStop(this.code, this.station, this.openingDate);
    }
}