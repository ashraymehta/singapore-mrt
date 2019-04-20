import {flatten} from 'lodash';
import {Line} from '../models/line';
import {Metro} from '../models/metro';
import {Station} from '../models/station';
import {LineStop} from '../models/line-stop';
import {RoutingDataPreparer} from './routing-data-preparer';
import {GraphTraversalData} from '../models/router/graph-traversal-data';

export class Router {
    private readonly dataPreparer: RoutingDataPreparer;

    constructor(dataProvider: RoutingDataPreparer) {
        this.dataPreparer = dataProvider;
    }

    public async findRouteBetween(source: Station, destination: Station, metro: Metro): Promise<LineStop[]> {
        const {allLines, allStops} = await this.dataPreparer.provide(metro);

        const sourceStop = allStops.find(stop => stop.isFor(source));
        const destinationStop = allStops.find(stop => stop.isFor(destination));

        const unvisitedStops = new Set(allStops);
        const stopReachabilityData = new GraphTraversalData();
        allStops.forEach(stop => stopReachabilityData.set(stop, {timeTaken: Number.MAX_VALUE, previousStop: undefined}));

        let currentStop = sourceStop;
        stopReachabilityData.set(sourceStop, {timeTaken: 0, previousStop: undefined});

        while (unvisitedStops.size !== 0 && currentStop !== undefined) {
            const neighbouringStops = this.getNeighbouringStops(allLines, currentStop);
            neighbouringStops.forEach(neighbour => stopReachabilityData.setTimeTakenForNeighbour(neighbour, currentStop, 1));
            unvisitedStops.delete(currentStop);
            currentStop = stopReachabilityData.getNearestUnvisitedStop(unvisitedStops);
        }

        return this.createRoute(sourceStop, destinationStop, stopReachabilityData);
    }

    private createRoute(sourceStop: LineStop, destinationStop: LineStop, stopReachabilityData: GraphTraversalData): LineStop[] {
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