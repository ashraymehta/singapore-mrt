import {Metro} from '../models/metro';
import {Station} from '../models/station';
import {LineStop} from '../models/line-stop';
import {RouteCreator} from './route-creator';
import {RoutingDataPreparer} from './routing-data-preparer';
import {GraphTraversalState} from '../models/router/graph-traversal-state';

export class Router {
    private readonly routeCreator: RouteCreator;
    private readonly dataPreparer: RoutingDataPreparer;

    constructor(dataProvider: RoutingDataPreparer, routeCreator: RouteCreator) {
        this.dataPreparer = dataProvider;
        this.routeCreator = routeCreator;
    }

    public async findRoutesBetween(source: Station, destination: Station, metro: Metro): Promise<LineStop[][]> {
        const {allLines, allStops} = await this.dataPreparer.provide(metro);

        const sourceStop = allStops.find(stop => stop.isFor(source));
        const destinationStop = allStops.find(stop => stop.isFor(destination));

        let currentStop = sourceStop;
        const graphTraversalState = GraphTraversalState.start(allStops, sourceStop);

        while (graphTraversalState.unvisitedStops.size !== 0 && currentStop !== undefined) {
            const neighbouringStops = allLines.getNeighbouringStopsFor(currentStop);
            neighbouringStops.forEach(neighbour => {
                const line = [...allLines].find(line => line.hasStop(currentStop) && line.hasStop(neighbour));
                return graphTraversalState.updateTimeTaken(neighbour, currentStop, line.getTimeTakenBetweenStations());
            });
            graphTraversalState.markStopAsVisited(currentStop);
            currentStop = graphTraversalState.getNearestUnvisitedStop();
        }

        return this.routeCreator.createFrom(sourceStop, destinationStop, graphTraversalState);
    }
}