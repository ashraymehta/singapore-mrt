import {Metro} from '../models/metro';
import {Station} from '../models/station';
import {LineStop} from '../models/line-stop';
import {RouteCreator} from './route-creator';
import {RoutingDataPreparer} from './routing-data-preparer';
import {GraphTraversalManager} from './graph-traversal-manager';

export class Router {
    private readonly routeCreator: RouteCreator;
    private readonly dataPreparer: RoutingDataPreparer;
    private readonly graphTraversalStateManager: GraphTraversalManager;

    constructor(dataProvider: RoutingDataPreparer, routeCreator: RouteCreator, graphTraversalStateManager: GraphTraversalManager) {
        this.dataPreparer = dataProvider;
        this.routeCreator = routeCreator;
        this.graphTraversalStateManager = graphTraversalStateManager;
    }

    public async findRoutesBetween(source: Station, destination: Station, metro: Metro): Promise<LineStop[][]> {
        const {allLines, allStops} = await this.dataPreparer.provide(metro);

        const sourceStop = allStops.find(stop => stop.isFor(source));
        const destinationStop = allStops.find(stop => stop.isFor(destination));

        const graphIterator = this.graphTraversalStateManager.startTraversal(allStops, sourceStop);

        while (graphIterator.hasNext()) {
            const currentStop = graphIterator.moveToNext();

            allLines.getNeighbouringStopsFor(currentStop)
                .filter(neighbour => graphIterator.unvisitedStops.has(neighbour))
                .forEach(neighbour => {
                    const line = allLines.findLineWithStops(currentStop, neighbour);
                    return graphIterator.optionallySaveTimeToLineStop(neighbour, currentStop, line.getTimeTakenBetweenStations());
                });
            if (currentStop === destinationStop) {
                break;
            }
        }

        return this.routeCreator.createFrom(sourceStop, destinationStop, graphIterator);
    }
}