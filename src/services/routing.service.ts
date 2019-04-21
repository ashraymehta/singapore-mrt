import {intersection} from 'lodash';
import {Metro} from '../models/metro';
import {Station} from '../models/station';
import {LineStop} from '../models/line-stop';
import {RouteCreator} from './routing/route-creator';
import {RoutingDataPreparer} from './routing/routing-data-preparer';
import {GraphTraversalManager} from './routing/graph-traversal-manager';

export class RoutingService {
    private readonly routeCreator: RouteCreator;
    private readonly dataPreparer: RoutingDataPreparer;
    private readonly graphTraversalStateManager: GraphTraversalManager;

    constructor(dataProvider: RoutingDataPreparer, routeCreator: RouteCreator, graphTraversalStateManager: GraphTraversalManager) {
        this.dataPreparer = dataProvider;
        this.routeCreator = routeCreator;
        this.graphTraversalStateManager = graphTraversalStateManager;
    }

    public async findRoutesBetween(source: Station, destination: Station, metro: Metro): Promise<LineStop[][]> {
        const {allLines, allStops} = await this.dataPreparer.prepare(metro);

        const sourceStop = allStops.find(stop => stop.isFor(source));
        const destinationStop = allStops.find(stop => stop.isFor(destination));

        const traverser = this.graphTraversalStateManager.startTraversal(allStops, sourceStop);

        while (traverser.hasNext() && traverser.getCurrentStop() !== destinationStop) {
            const currentStop = traverser.moveToNext();

            const neighbouringStops = allLines.getNeighbouringStopsFor(currentStop);
            const unvisitedNeighbours = intersection(neighbouringStops, [...traverser.unvisitedStops]);
            unvisitedNeighbours.forEach(neighbour => {
                const line = allLines.findLineWithStops(currentStop, neighbour);
                return traverser.optionallySaveTimeToLineStop(neighbour, currentStop, line.getTimeTakenBetweenStations());
            });
        }

        return this.routeCreator.createFrom(destinationStop, sourceStop, traverser);
    }
}