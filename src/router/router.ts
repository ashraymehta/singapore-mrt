import {Line} from '../models/line';
import {Metro} from '../models/metro';
import {flatten, minBy} from 'lodash';
import {Station} from '../models/station';
import {LineStop} from '../models/line-stop';

export class Router {
    public async findRouteBetween(source: Station, destination: Station, metro: Metro): Promise<LineStop[]> {
        const allStops = flatten(metro.lines.map(line => line.stops));
        const sourceStop = allStops.find(stop => stop.isFor(source));
        const destinationStop = allStops.find(stop => stop.isFor(destination));

        const unvisitedStops = new Set(allStops);
        const stopReachabilityData = new Map<LineStop, { timeTaken: number, previousStop: LineStop }>();
        unvisitedStops.forEach(stop => stopReachabilityData.set(stop, {timeTaken: Number.MAX_VALUE, previousStop: undefined}));

        let currentStop = sourceStop;
        stopReachabilityData.set(sourceStop, {timeTaken: 0, previousStop: undefined});

        while (unvisitedStops.size !== 0) {
            const neighbouringStops = this.getNeighbouringStops(metro.lines, currentStop);
            neighbouringStops.forEach(neighbour => {
                const timeTakenFromHere = 1;
                const timeTakenFromSource = stopReachabilityData.get(currentStop).timeTaken + timeTakenFromHere;
                if (timeTakenFromSource < stopReachabilityData.get(neighbour).timeTaken) {
                    stopReachabilityData.set(neighbour, {timeTaken: timeTakenFromSource, previousStop: currentStop});
                }
            });
            unvisitedStops.delete(currentStop);
            currentStop = minBy([...stopReachabilityData.entries()], ([stop, datum]) => {
                return unvisitedStops.has(stop) ? datum.timeTaken : Number.MAX_VALUE;
            })[0];
        }

        currentStop = destinationStop;
        const route: LineStop[] = [currentStop];
        while (currentStop !== sourceStop) {
            currentStop = stopReachabilityData.get(currentStop).previousStop;
            route.push(currentStop);
        }
        return route.reverse();
    }

    private getNeighbouringStops(lines: Line[], currentStop: LineStop): LineStop[] {
        const lineWithStop = lines.find(line => line.stops.includes(currentStop));
        const previousStop = lineWithStop.stops[lineWithStop.stops.indexOf(currentStop) - 1];
        const nextStop = lineWithStop.stops[lineWithStop.stops.indexOf(currentStop) + 1];
        return [previousStop, nextStop].filter(stop => !!stop);
    }
}