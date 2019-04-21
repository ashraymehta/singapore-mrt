import {Line} from './line';
import {LineStop} from './line-stop';

export class Route extends Array<LineStop> {
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
}