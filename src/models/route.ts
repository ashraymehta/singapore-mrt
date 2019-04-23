import {EOL} from 'os';
import {Line} from './line';
import {uniq} from 'lodash';
import {LineStop} from './line-stop';
import {Stations} from './stations';

export class Route extends Array<LineStop> {
    public timeTaken: number;

    constructor(timeTaken: number, ...items: LineStop[]) {
        super(...items);
        this.timeTaken = timeTaken;
    }

    public getStations(): Stations {
        return new Stations(this.map(s => s.stoppingAt));
    }

    public describe(): string[] {
        const stopPairs = this.slice(0, this.length - 1).map((stop, index) => [stop, this[index + 1]]);
        return stopPairs.map(([oneStop, anotherStop]) => {
            const lineCode = oneStop.code.substr(0, Line.LineCodeLength);
            if (oneStop.stoppingAt === anotherStop.stoppingAt) {
                const newLineCode = anotherStop.code.substr(0, Line.LineCodeLength);
                return `Change from ${lineCode} line to ${newLineCode} line`;
            }
            return `Take ${lineCode} line from ${oneStop.stoppingAt.name} to ${anotherStop.stoppingAt.name}`
        });
    }

    public toString(): string {
        const numberOfStations = uniq(this.map(stop => stop.stoppingAt)).length;
        return ['', `Stations travelled: ${numberOfStations}`, `Time: ${this.timeTaken} minutes`,
            `Route: (${this.map(s => `'${s.code}'`).join(', ')})`, '',
            ...this.describe()].join(EOL)
    }
}