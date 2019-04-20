import {Line} from './line';
import {LineStop} from './line-stop';

export class IntersectionLine extends Line {
    private constructor(oneStop: LineStop, anotherStop: LineStop) {
        super([oneStop, anotherStop]);
    }

    public static create(oneStop: LineStop, anotherStop: LineStop) {
        return new IntersectionLine(oneStop, anotherStop);
    }

    public getTimeTakenBetweenStations(): number {
        return 0;
    }
}