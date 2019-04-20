import {Line} from './line';
import {flatten} from 'lodash';
import {LineStop} from './line-stop';

export class Lines extends Set<Line> {
    public getAllStops(): LineStop[] {
        return flatten([...this].map(line => line.stops));
    }

    public getNeighbouringStopsFor(stop: LineStop): LineStop[] {
        const neighbouringStopPairs = [...this].filter(line => line.stops.includes(stop))
            .map(line => {
                const previousStop = line.stops[line.stops.indexOf(stop) - 1];
                const nextStop = line.stops[line.stops.indexOf(stop) + 1];
                return [previousStop, nextStop].filter(stop => !!stop);
            });
        return flatten(neighbouringStopPairs);
    }
}