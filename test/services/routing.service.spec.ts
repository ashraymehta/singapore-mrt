import {Line} from '../../src/models/line';
import {suite, test} from 'mocha-typescript';
import {Lines} from '../../src/models/lines';
import {Station} from '../../src/models/station';
import {LineStopBuilder} from '../builders/line-stop.builder';
import {RoutingService} from '../../src/services/routing.service';
import {anything, instance, mock, verify, when} from 'ts-mockito';
import {RouteCreator} from '../../src/services/routing/route-creator';
import {LinesRepository} from '../../src/repositories/lines.repository';
import {RoutingDataPreparer} from '../../src/services/routing/routing-data-preparer';
import {GraphTraversalManager} from '../../src/services/routing/graph-traversal-manager';
import {DijkstraGraphTraverser} from '../../src/services/routing/dijkstra-graph-traverser';

@suite
class RoutingServiceSpec {
    private router: RoutingService;
    private routeCreator: RouteCreator;
    private linesRepository: LinesRepository;
    private traversalManager: GraphTraversalManager;
    private routingDataPreparer: RoutingDataPreparer;

    public before(): void {
        this.routeCreator = mock(RouteCreator);
        this.linesRepository = mock(LinesRepository);
        this.traversalManager = mock(GraphTraversalManager);
        this.routingDataPreparer = mock(RoutingDataPreparer);
        this.router = new RoutingService(instance(this.routingDataPreparer), instance(this.routeCreator),
            instance(this.traversalManager), instance(this.linesRepository));
    }

    @test
    public async shouldInvokeDataPreparerToPrepareData(): Promise<void> {
        const source = new Station('Source Station');
        const destination = new Station('Destination Station');
        const lines = new Lines([new Line([LineStopBuilder.withDefaults().build()])]);
        when(this.linesRepository.findAll()).thenReturn(lines);
        when(this.routingDataPreparer.prepare(lines)).thenResolve({allLines: lines, allStops: []});
        when(this.traversalManager.startTraversal(anything(), anything())).thenReturn(DijkstraGraphTraverser.traverseWith([], null));

        await this.router.findRoutesBetween(source, destination);

        verify(this.routingDataPreparer.prepare(lines)).once();
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
        when(this.routingDataPreparer.prepare(lines)).thenResolve({allLines: lines, allStops: allStops});
        when(this.traversalManager.startTraversal(anything(), anything())).thenReturn(instance(traverser));

        await this.router.findRoutesBetween(source, destination);

        verify(this.traversalManager.startTraversal(allStops, lineStopForSource)).once();
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
        when(this.routingDataPreparer.prepare(lines)).thenResolve({allLines: lines, allStops: allStops});
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
        when(this.routingDataPreparer.prepare(lines)).thenResolve({allLines: lines, allStops: allStops});
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
        when(this.routingDataPreparer.prepare(lines)).thenResolve({allLines: lines, allStops: allStops});
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
        when(this.routingDataPreparer.prepare(lines)).thenResolve({allLines: lines, allStops: allStops});
        when(traverser.moveToNext()).thenReturn(lineStopForSource, aLineStop, yetAnotherLineStop, anotherLineStop);
        when(traverser.unvisitedStops).thenReturn(new Set([anotherLineStop]));
        when(traverser.getCurrentStop()).thenReturn(undefined, lineStopForSource, aLineStop);
        when(traverser.hasNext()).thenReturn(true, true);

        await this.router.findRoutesBetween(source, destination);

        verify(traverser.hasNext()).twice();
        verify(traverser.moveToNext()).once();
    }
}