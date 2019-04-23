import {inject} from 'inversify';
import {intersection} from 'lodash';
import {Routes} from '../models/routes';
import {Station} from '../models/station';
import {provide} from 'inversify-binding-decorators';
import {RoutesCreator} from './routing/routes-creator';
import {LinesRepository} from '../repositories/lines.repository';
import {RoutingDataPreparer} from './routing/routing-data-preparer';
import {GraphTraversalManager} from './routing/graph-traversal-manager';

@provide(RoutingService)
export class RoutingService {
    private readonly routeCreator: RoutesCreator;
    private readonly linesRepository: LinesRepository;
    private readonly dataPreparer: RoutingDataPreparer;
    private readonly graphTraversalStateManager: GraphTraversalManager;

    constructor(@inject(RoutingDataPreparer) dataPreparer: RoutingDataPreparer, @inject(RoutesCreator) routeCreator: RoutesCreator,
                @inject(GraphTraversalManager) traversalManager: GraphTraversalManager, @inject(LinesRepository) linesRepository: LinesRepository) {
        this.dataPreparer = dataPreparer;
        this.routeCreator = routeCreator;
        this.linesRepository = linesRepository;
        this.graphTraversalStateManager = traversalManager;
    }

    public async findRoutesBetween(source: Station, destination: Station, timeOfTravel?: Date): Promise<Routes> {
        const lines = this.linesRepository.findAll();
        const {allLines, allStops} = await this.dataPreparer.prepare(lines, timeOfTravel);
        const sourceStops = allStops.filter(stop => stop.isFor(source));
        const destinationStops = allStops.filter(stop => stop.isFor(destination));

        const traverser = this.graphTraversalStateManager.startTraversal(allStops, sourceStops);

        while (traverser.hasNext() && (traverser.getCurrentStop() ? traverser.getCurrentStop().stoppingAt !== destination : true)) {
            const currentStop = traverser.moveToNext();

            const neighbouringStops = allLines.getNeighbouringStopsFor(currentStop);
            const unvisitedNeighbours = intersection(neighbouringStops, [...traverser.unvisitedStops]);
            unvisitedNeighbours.forEach(neighbour => {
                const line = allLines.findLineWithStops(currentStop, neighbour);
                return traverser.optionallySaveTimeToLineStop(neighbour, currentStop, line.getTimeTakenBetweenStations());
            });
        }

        return this.routeCreator.createFrom(destinationStops, sourceStops, traverser);
    }
}