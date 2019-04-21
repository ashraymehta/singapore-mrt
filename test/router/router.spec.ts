import {Line} from '../../src/models/line';
import {suite, test} from 'mocha-typescript';
import {Metro} from '../../src/models/metro';
import {Lines} from '../../src/models/lines';
import {Router} from '../../src/router/router';
import {Station} from '../../src/models/station';
import {RouteCreator} from '../../src/router/route-creator';
import {LineStopBuilder} from '../builders/line-stop.builder';
import {anything, instance, mock, verify, when} from 'ts-mockito';
import {RoutingDataPreparer} from '../../src/router/routing-data-preparer';
import {GraphTraversalManager} from '../../src/router/graph-traversal-manager';
import {DijkstraGraphTraverser} from '../../src/router/dijkstra-graph-traverser';

@suite
class RouterSpec {
    private router: Router;
    private routeCreator: RouteCreator;
    private traversalManager: GraphTraversalManager;
    private routingDataPreparer: RoutingDataPreparer;

    public before(): void {
        this.routeCreator = mock(RouteCreator);
        this.traversalManager = mock(GraphTraversalManager);
        this.routingDataPreparer = mock(RoutingDataPreparer);
        this.router = new Router(instance(this.routingDataPreparer), instance(this.routeCreator), instance(this.traversalManager));
    }

    @test
    public async shouldInvokeDataPreparerToPrepareData(): Promise<void> {
        const source = new Station('Source Station');
        const destination = new Station('Destination Station');
        const lines = new Lines([new Line([LineStopBuilder.withDefaults().build()])]);
        const metro = new Metro(lines, null);
        when(this.routingDataPreparer.prepare(metro)).thenResolve({allLines: lines, allStops: []});
        when(this.traversalManager.startTraversal(anything(), anything())).thenReturn(DijkstraGraphTraverser.traverseWith([], null));

        await this.router.findRoutesBetween(source, destination, metro);

        verify(this.routingDataPreparer.prepare(metro)).once();
    }

    @test
    public async shouldInitializeGraphTraversal(): Promise<void> {
        const source = new Station('Source Station');
        const destination = new Station('Destination Station');
        const anotherLineStop = LineStopBuilder.withDefaults().build();
        const lineStopForSource = LineStopBuilder.withDefaults().stoppingAt(source).build();
        const allStops = [lineStopForSource, anotherLineStop];

        const lines = new Lines([new Line([lineStopForSource, anotherLineStop])]);
        const metro = new Metro(lines, null);

        const traverser = mock(DijkstraGraphTraverser);
        when(this.routingDataPreparer.prepare(metro)).thenResolve({allLines: lines, allStops: allStops});
        when(this.traversalManager.startTraversal(anything(), anything())).thenReturn(instance(traverser));

        await this.router.findRoutesBetween(source, destination, metro);

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
        const metro = new Metro(lines, null);

        const traverser = mock(DijkstraGraphTraverser);
        when(this.routingDataPreparer.prepare(metro)).thenResolve({allLines: lines, allStops: allStops});
        when(this.traversalManager.startTraversal(anything(), anything())).thenReturn(instance(traverser));
        when(traverser.hasNext()).thenReturn(true).thenReturn(true).thenReturn(false);
        when(traverser.unvisitedStops).thenReturn(new Set([lineStopForSource, anotherLineStop]));

        await this.router.findRoutesBetween(source, destination, metro);

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
        const metro = new Metro(lines, null);

        const traverser = mock(DijkstraGraphTraverser);
        when(this.routingDataPreparer.prepare(metro)).thenResolve({allLines: lines, allStops: allStops});
        when(this.traversalManager.startTraversal(anything(), anything())).thenReturn(instance(traverser));
        when(traverser.hasNext()).thenReturn(true, true, false);
        when(traverser.moveToNext()).thenReturn(lineStopForSource, aLineStop, anotherLineStop);
        when(traverser.unvisitedStops).thenReturn(new Set([aLineStop, anotherLineStop]));

        await this.router.findRoutesBetween(source, destination, metro);

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
        const metro = new Metro(lines, null);

        const traverser = mock(DijkstraGraphTraverser);
        when(this.routingDataPreparer.prepare(metro)).thenResolve({allLines: lines, allStops: allStops});
        when(this.traversalManager.startTraversal(anything(), anything())).thenReturn(instance(traverser));
        when(traverser.moveToNext()).thenReturn(lineStopForSource, aLineStop, anotherLineStop);
        when(traverser.unvisitedStops).thenReturn(new Set([anotherLineStop]));
        when(traverser.hasNext()).thenReturn(true, true, false);

        await this.router.findRoutesBetween(source, destination, metro);

        verify(traverser.optionallySaveTimeToLineStop(aLineStop, lineStopForSource, 1)).never();
        verify(traverser.optionallySaveTimeToLineStop(anotherLineStop, aLineStop, 1)).once();
    }

    @test
    public async shouldStopIterationWhenDestinationStopIsReached(): Promise<void> {
        const source = new Station('Source Station');
        const destination = new Station('Destination Station');
        const anotherLineStop = LineStopBuilder.withDefaults().build();
        const aLineStop = LineStopBuilder.withDefaults().stoppingAt(destination).build();
        const lineStopForSource = LineStopBuilder.withDefaults().stoppingAt(source).build();
        const allStops = [lineStopForSource, aLineStop, anotherLineStop];

        const lines = new Lines([new Line([lineStopForSource, aLineStop, anotherLineStop])]);
        const metro = new Metro(lines, null);

        const traverser = mock(DijkstraGraphTraverser);
        when(this.routingDataPreparer.prepare(metro)).thenResolve({allLines: lines, allStops: allStops});
        when(this.traversalManager.startTraversal(anything(), anything())).thenReturn(instance(traverser));
        when(traverser.moveToNext()).thenReturn(lineStopForSource, aLineStop, anotherLineStop);
        when(traverser.unvisitedStops).thenReturn(new Set([anotherLineStop]));
        when(traverser.getCurrentStop()).thenReturn(lineStopForSource, aLineStop);
        when(traverser.hasNext()).thenReturn(true, true);

        await this.router.findRoutesBetween(source, destination, metro);

        verify(traverser.hasNext()).twice();
        verify(traverser.moveToNext()).once();
    }
}