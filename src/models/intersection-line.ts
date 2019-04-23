import {Line} from './line';
import {LineStop} from './line-stop';

export class IntersectionLine extends Line {
    private constructor(oneStop: LineStop, anotherStop: LineStop) {
        super([oneStop, anotherStop]);
    }

    public static create(oneStop: LineStop, anotherStop: LineStop, timeTakenToChangeLines: number): IntersectionLine {
        const intersectionLine = new IntersectionLine(oneStop, anotherStop);
        intersectionLine.setTimeTakenBetweenStations(timeTakenToChangeLines);
        return intersectionLine;
    }
}