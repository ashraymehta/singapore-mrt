import {Metro} from '../models/metro';
import {Station} from '../models/station';
import {LineStop} from '../models/line-stop';
import {RoutingDataPreparer} from './routing-data-preparer';
import {GraphTraversalState} from '../models/router/graph-traversal-state';

export class Router {
    private readonly dataPreparer: RoutingDataPreparer;

    constructor(dataProvider: RoutingDataPreparer) {
        this.dataPreparer = dataProvider;
    }

    public async findRouteBetween(source: Station, destination: Station, metro: Metro): Promise<LineStop[]> {
        const {allLines, allStops} = await this.dataPreparer.provide(metro);

        const sourceStop = allStops.find(stop => stop.isFor(source));
        const destinationStop = allStops.find(stop => stop.isFor(destination));

        let currentStop = sourceStop;
        const graphTraversalState = GraphTraversalState.start(allStops, sourceStop);

        while (graphTraversalState.unvisitedStops.size !== 0 && currentStop !== undefined) {
            const neighbouringStops = allLines.getNeighbouringStopsFor(currentStop);
            neighbouringStops.forEach(neighbour => graphTraversalState.updateTimeTaken(neighbour, currentStop, 1));
            graphTraversalState.markStopAsVisited(currentStop);
            currentStop = graphTraversalState.getNearestUnvisitedStop();
        }

        return this.createRoute(sourceStop, destinationStop, graphTraversalState);
    }

    private createRoute(sourceStop: LineStop, destinationStop: LineStop, traversalState: GraphTraversalState): LineStop[] {
        let currentStop = destinationStop;
        const route: LineStop[] = [currentStop];
        while (currentStop !== sourceStop) {
            currentStop = traversalState.routeToStop.get(currentStop).previousStop;
            route.push(currentStop);
            if (currentStop === undefined) {
                return [];
            }
        }
        return route.reverse();
    }

}