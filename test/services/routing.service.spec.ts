import {Line} from '../../src/models/line';
import {suite, test} from 'mocha-typescript';
import {Lines} from '../../src/models/lines';
import {Station} from '../../src/models/station';
import {LineStopBuilder} from '../builders/line-stop.builder';
import {RoutingService} from '../../src/services/routing-service';
import {LinesRepository} from '../../src/repositories/lines-repository';
import {RoutesCreator} from '../../src/services/dijkstra/routes-creator';
import {anything, deepEqual, instance, mock, verify, when} from 'ts-mockito';
import {DijkstraDataPreparer} from '../../src/services/dijkstra/dijkstra-data-preparer';
import {GraphTraversalManager} from '../../src/services/dijkstra/graph-traversal-manager';
import {DijkstraGraphTraverser} from '../../src/services/dijkstra/dijkstra-graph-traverser';

@suite
class RoutingServiceSpec {
    private router: RoutingService;
    private routeCreator: RoutesCreator;
    private linesRepository: LinesRepository;
    private traversalManager: GraphTraversalManager;
    private dijkstraDataPreparer: DijkstraDataPreparer;

    public before(): void {
        this.routeCreator = mock(RoutesCreator);
        this.linesRepository = mock(LinesRepository);
        this.traversalManager = mock(GraphTraversalManager);
        this.dijkstraDataPreparer = mock(DijkstraDataPreparer);
        this.router = new RoutingService(instance(this.dijkstraDataPreparer), instance(this.routeCreator),
            instance(this.traversalManager), instance(this.linesRepository));
    }

    @test
    public async shouldInvokeDataPreparerToPrepareData(): Promise<void> {
        const source = new Station('Source Station');
        const destination = new Station('Destination Station');
        const lines = new Lines([new Line([LineStopBuilder.withDefaults().build()])]);
        when(this.linesRepository.findAll()).thenReturn(lines);
        when(this.dijkstraDataPreparer.prepare(lines, undefined)).thenResolve({allLines: lines, allStops: []});
        when(this.traversalManager.startTraversal(anything(), anything())).thenReturn(DijkstraGraphTraverser.traverseWith([], []));

        await this.router.findRoutesBetween(source, destination);

        verify(this.dijkstraDataPreparer.prepare(lines, undefined)).once();
    }

    @test
    public async shouldInvokeDataPreparerWithTimeOfTravelToPrepareData(): Promise<void> {
        const timeOfTravel = new Date();
        const source = new Station('Source Station');
        const destination = new Station('Destination Station');
        const lines = new Lines([new Line([LineStopBuilder.withDefaults().build()])]);
        when(this.linesRepository.findAll()).thenReturn(lines);
        when(this.dijkstraDataPreparer.prepare(lines, timeOfTravel)).thenResolve({allLines: lines, allStops: []});
        when(this.traversalManager.startTraversal(anything(), anything())).thenReturn(DijkstraGraphTraverser.traverseWith([], []));

        await this.router.findRoutesBetween(source, destination, timeOfTravel);

        verify(this.dijkstraDataPreparer.prepare(lines, timeOfTravel)).once();
    }

    @test
    public async shouldInitializeGraphTraversal(): Promise<void> {
        const source = new Station('Source Station');
        const destination = new Station('Destination Station');
        const anotherLineStop = LineStopBuilder.withDefaults().build();
        const lineStopForSource = LineStopBuilder.withDefaults().stoppingAt(source).build();
        const allStops = [lineStopForSource, anotherLineStop];

        const lines = new Lines([new Line([lineStopForSource, anotherLineStop])]);

        const traverser = mock(DijkstraGraphTraverser);
        when(this.linesRepository.findAll()).thenReturn(lines);
        when(this.dijkstraDataPreparer.prepare(lines, undefined)).thenResolve({allLines: lines, allStops});
        when(this.traversalManager.startTraversal(anything(), anything())).thenReturn(instance(traverser));

        await this.router.findRoutesBetween(source, destination);

        verify(this.traversalManager.startTraversal(allStops, deepEqual([lineStopForSource]))).once();
    }

    @test
    public async shouldInitializeGraphTraversalWithMultipleSourceStopsWhenStartingAtAnIntersection(): Promise<void> {
        const source = new Station('Source Station');
        const destination = new Station('Destination Station');
        const aDifferentLineStop = LineStopBuilder.withDefaults().build();
        const aLineStopForSource = LineStopBuilder.withDefaults().stoppingAt(source).build();
        const anotherLineStopForSource = LineStopBuilder.withDefaults().stoppingAt(source).build();
        const allStops = [aLineStopForSource, anotherLineStopForSource, aDifferentLineStop];

        const lines = new Lines([new Line([aLineStopForSource, anotherLineStopForSource, aDifferentLineStop])]);

        const traverser = mock(DijkstraGraphTraverser);
        when(this.linesRepository.findAll()).thenReturn(lines);
        when(this.dijkstraDataPreparer.prepare(lines, undefined)).thenResolve({allLines: lines, allStops});
        when(this.traversalManager.startTraversal(anything(), anything())).thenReturn(instance(traverser));

        await this.router.findRoutesBetween(source, destination);

        verify(this.traversalManager.startTraversal(allStops, deepEqual([aLineStopForSource, anotherLineStopForSource]))).once();
    }

    @test
    public async shouldIterateThroughTheGraphOnlyWhileThereIsANextStopAvailable(): Promise<void> {
        const source = new Station('Source Station');
        const destination = new Station('Destination Station');
        const anotherLineStop = LineStopBuilder.withDefaults().build();
        const lineStopForSource = LineStopBuilder.withDefaults().stoppingAt(source).build();
        const allStops = [lineStopForSource, anotherLineStop];

        const lines = new Lines([new Line([lineStopForSource, anotherLineStop])]);

        const traverser = mock(DijkstraGraphTraverser);
        when(this.linesRepository.findAll()).thenReturn(lines);
        when(this.dijkstraDataPreparer.prepare(lines, undefined)).thenResolve({allLines: lines, allStops});
        when(this.traversalManager.startTraversal(anything(), anything())).thenReturn(instance(traverser));
        when(traverser.hasNext()).thenReturn(true).thenReturn(true).thenReturn(false);
        when(traverser.unvisitedStops).thenReturn(new Set([lineStopForSource, anotherLineStop]));
        when(traverser.unvisitedStops).thenReturn(new Set([lineStopForSource, anotherLineStop]));

        await this.router.findRoutesBetween(source, destination);

        verify(traverser.moveToNext()).twice();
    }

    @test
    public async shouldUpdateTimeTakenForNeighbouringStopsDuringAnIteration(): Promise<void> {
        const source = new Station('Source Station');
        const destination = new Station('Destination Station');
        const aLineStop = LineStopBuilder.withDefaults().build();
        const anotherLineStop = LineStopBuilder.withDefaults().build();
        const lineStopForSource = LineStopBuilder.withDefaults().stoppingAt(source).build();
        const allStops = [lineStopForSource, aLineStop, anotherLineStop];

        const lines = new Lines([new Line([lineStopForSource, aLineStop, anotherLineStop])]);

        const traverser = mock(DijkstraGraphTraverser);
        when(this.linesRepository.findAll()).thenReturn(lines);
        when(this.dijkstraDataPreparer.prepare(lines, undefined)).thenResolve({allLines: lines, allStops});
        when(this.traversalManager.startTraversal(anything(), anything())).thenReturn(instance(traverser));
        when(traverser.hasNext()).thenReturn(true, true, false);
        when(traverser.moveToNext()).thenReturn(lineStopForSource, aLineStop, anotherLineStop);
        when(traverser.unvisitedStops).thenReturn(new Set([aLineStop, anotherLineStop]));

        await this.router.findRoutesBetween(source, destination);

        verify(traverser.optionallySaveTimeToLineStop(aLineStop, lineStopForSource, 1)).once();
        verify(traverser.optionallySaveTimeToLineStop(anotherLineStop, aLineStop, 1)).once();
    }

    @test
    public async shouldUpdateTimeTakenOnlyForNeighbouringStopsWhichAreUnvisitedDuringAnIteration(): Promise<void> {
        const source = new Station('Source Station');
        const destination = new Station('Destination Station');
        const aLineStop = LineStopBuilder.withDefaults().build();
        const anotherLineStop = LineStopBuilder.withDefaults().build();
        const lineStopForSource = LineStopBuilder.withDefaults().stoppingAt(source).build();
        const allStops = [lineStopForSource, aLineStop, anotherLineStop];

        const lines = new Lines([new Line([lineStopForSource, aLineStop, anotherLineStop])]);

        const traverser = mock(DijkstraGraphTraverser);
        when(this.linesRepository.findAll()).thenReturn(lines);
        when(this.dijkstraDataPreparer.prepare(lines, undefined)).thenResolve({allLines: lines, allStops});
        when(this.traversalManager.startTraversal(anything(), anything())).thenReturn(instance(traverser));
        when(traverser.moveToNext()).thenReturn(lineStopForSource, aLineStop, anotherLineStop);
        when(traverser.unvisitedStops).thenReturn(new Set([anotherLineStop]));
        when(traverser.hasNext()).thenReturn(true, true, false);

        await this.router.findRoutesBetween(source, destination);

        verify(traverser.optionallySaveTimeToLineStop(aLineStop, lineStopForSource, 1)).never();
        verify(traverser.optionallySaveTimeToLineStop(anotherLineStop, aLineStop, 1)).once();
    }

    @test
    public async shouldStopIterationWhenDestinationStationIsReached(): Promise<void> {
        const source = new Station('Source Station');
        const destination = new Station('Destination Station');
        const anotherLineStop = LineStopBuilder.withDefaults().build();
        const aLineStop = LineStopBuilder.withDefaults().stoppingAt(destination).build();
        const yetAnotherLineStop = LineStopBuilder.withDefaults().stoppingAt(destination).build();
        const lineStopForSource = LineStopBuilder.withDefaults().stoppingAt(source).build();
        const allStops = [lineStopForSource, yetAnotherLineStop, aLineStop, anotherLineStop];

        const lines = new Lines([new Line([lineStopForSource, aLineStop, yetAnotherLineStop, anotherLineStop])]);

        const traverser = mock(DijkstraGraphTraverser);
        when(this.linesRepository.findAll()).thenReturn(lines);
        when(this.traversalManager.startTraversal(anything(), anything())).thenReturn(instance(traverser));
        when(this.dijkstraDataPreparer.prepare(lines, undefined)).thenResolve({allLines: lines, allStops});
        when(traverser.moveToNext()).thenReturn(lineStopForSource, aLineStop, yetAnotherLineStop, anotherLineStop);
        when(traverser.getCurrentStop()).thenReturn(undefined, lineStopForSource, aLineStop);
        when(traverser.unvisitedStops).thenReturn(new Set([anotherLineStop]));
        when(traverser.hasNext()).thenReturn(true, true);

        await this.router.findRoutesBetween(source, destination);

        verify(traverser.hasNext()).twice();
        verify(traverser.moveToNext()).once();
    }
}