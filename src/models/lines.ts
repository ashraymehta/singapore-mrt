import {Line} from './line';
import {Stations} from './stations';
import {flatten, uniq} from 'lodash';
import {LineStop} from './line-stop';

export class Lines extends Set<Line> {
    public getAllStops(): LineStop[] {
        return flatten([...this].map(line => line.stops));
    }

    public getAllStations(): Stations {
        return new Stations(this.getAllStops().map(stop => stop.stoppingAt));
    }

    public getNeighbouringStopsFor(stop: LineStop): LineStop[] {
        const neighbouringStopPairs = [...this].filter(line => line.stops.includes(stop))
            .map(line => {
                const previousStop = line.stops[line.stops.indexOf(stop) - 1];
                const nextStop = line.stops[line.stops.indexOf(stop) + 1];
                return [previousStop, nextStop].filter(s => !!s);
            });
        return uniq(flatten(neighbouringStopPairs));
    }

    public findLineWithStops(oneStop: LineStop, anotherStop: LineStop): Line {
        return [...this].find(line => line.hasStop(oneStop) && line.hasStop(anotherStop));
    }
}