import {Line} from '../models/line';
import {Metro} from '../models/metro';
import {Station} from '../models/station';
import {LineStop} from '../models/line-stop';
import {clone, difference, flatten, minBy, uniq} from 'lodash';
import {StopReachabilityData} from '../models/router/stop-reachability-data';

export class Router {
    public async findRouteBetween(source: Station, destination: Station, metro: Metro): Promise<LineStop[]> {
        const allLines = clone(metro.lines);
        const allStops = flatten(allLines.map(line => line.stops));
        const stations = allStops.map(stop => stop.stoppingAt);
        const duplicateStations = uniq(stations.filter((station: Station, index: number) => {
            return stations.indexOf(station, index + 1) > 0;
        }));
        duplicateStations.forEach(station => {
            const stopsForStation = allStops.filter(stop => stop.isFor(station));
            const lines = stopsForStation.map(stop => {
                return difference(stopsForStation, [stop]).map(otherStop => new Line([stop, otherStop]));
            });
            allLines.push(...flatten(lines));
        });

        const sourceStop = allStops.find(stop => stop.isFor(source));
        const destinationStop = allStops.find(stop => stop.isFor(destination));

        const unvisitedStops = new Set(allStops);
        const stopReachabilityData = new StopReachabilityData();
        allStops.forEach(stop => stopReachabilityData.set(stop, {timeTaken: Number.MAX_VALUE, previousStop: undefined}));

        let currentStop = sourceStop;
        stopReachabilityData.set(sourceStop, {timeTaken: 0, previousStop: undefined});

        while (unvisitedStops.size !== 0 && currentStop !== undefined) {
            const neighbouringStops = this.getNeighbouringStops(allLines, currentStop);
            neighbouringStops.forEach(neighbour => {
                const timeTakenFromHere = 1;
                const timeTakenFromSource = stopReachabilityData.get(currentStop).timeTaken + timeTakenFromHere;
                if (timeTakenFromSource < stopReachabilityData.get(neighbour).timeTaken) {
                    stopReachabilityData.set(neighbour, {timeTaken: timeTakenFromSource, previousStop: currentStop});
                }
            });
            unvisitedStops.delete(currentStop);
            currentStop = this.getNextUnvisitedStop(stopReachabilityData, unvisitedStops);
        }

        return this.createRoute(sourceStop, destinationStop, stopReachabilityData);
    }

    private getNextUnvisitedStop(stopReachabilityData: StopReachabilityData, unvisitedStops: Set<LineStop>): LineStop | undefined {
        const reachabilityDataForNextStop = minBy([...stopReachabilityData.entries()], ([stop, datum]) => {
            return unvisitedStops.has(stop) ? datum.timeTaken : undefined;
        });
        return reachabilityDataForNextStop ? reachabilityDataForNextStop[0] : undefined;
    }

    private createRoute(sourceStop: LineStop, destinationStop: LineStop, stopReachabilityData: StopReachabilityData): LineStop[] {
        let currentStop = destinationStop;
        const route: LineStop[] = [currentStop];
        while (currentStop !== sourceStop) {
            currentStop = stopReachabilityData.get(currentStop).previousStop;
            route.push(currentStop);
            if (currentStop === undefined) {
                return [];
            }
        }
        return route.reverse();
    }

    private getNeighbouringStops(lines: Line[], currentStop: LineStop): LineStop[] {
        const neighbouringStopPairs = lines.filter(line => line.stops.includes(currentStop))
            .map(line => {
                const previousStop = line.stops[line.stops.indexOf(currentStop) - 1];
                const nextStop = line.stops[line.stops.indexOf(currentStop) + 1];
                return [previousStop, nextStop].filter(stop => !!stop);
            });
        return flatten(neighbouringStopPairs);
    }
}