import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {Route} from '../../../src/models/route';
import {Station} from '../../../src/models/station';
import {LineStopBuilder} from '../../builders/line-stop.builder';
import {RoutesCreator} from '../../../src/services/dijkstra/routes-creator';
import {DijkstraGraphTraverser} from '../../../src/services/dijkstra/dijkstra-graph-traverser';

@suite
class RoutesCreatorSpec {
    private routeCreator: RoutesCreator;

    public before(): void {
        this.routeCreator = new RoutesCreator();
    }

    @test
    public async shouldCreateRouteFromTraverser(): Promise<void> {
        const aLineStop = LineStopBuilder.withDefaults().build();
        const sourceLineStop = LineStopBuilder.withDefaults().build();
        const anotherLineStop = LineStopBuilder.withDefaults().build();
        const yetAnotherLineStop = LineStopBuilder.withDefaults().build();
        const destinationLineStop = LineStopBuilder.withDefaults().build();
        const allStops = [aLineStop, anotherLineStop, yetAnotherLineStop, sourceLineStop, destinationLineStop];

        const traverser = DijkstraGraphTraverser.traverseWith(allStops, [sourceLineStop]);
        traverser.optionallySaveTimeToLineStop(aLineStop, sourceLineStop, 1);
        traverser.optionallySaveTimeToLineStop(anotherLineStop, aLineStop, 1);
        traverser.optionallySaveTimeToLineStop(yetAnotherLineStop, anotherLineStop, 1);
        traverser.optionallySaveTimeToLineStop(destinationLineStop, yetAnotherLineStop, 1);

        const routes = this.routeCreator.createFrom([destinationLineStop], [sourceLineStop], traverser);

        expect(routes[0]).to.be.an.instanceOf(Route);
        expect(routes[0].timeTaken).to.equal(4);
        expect(routes).to.deep.equal([new Route(4, sourceLineStop, aLineStop, anotherLineStop, yetAnotherLineStop, destinationLineStop)]);
    }

    @test
    public async shouldCreateMultipleRoutesWhenAvailable(): Promise<void> {
        const aLineStop = LineStopBuilder.withDefaults().build();
        const sourceLineStop = LineStopBuilder.withDefaults().build();
        const anotherLineStop = LineStopBuilder.withDefaults().build();
        const yetAnotherLineStop = LineStopBuilder.withDefaults().build();
        const destinationLineStop = LineStopBuilder.withDefaults().build();
        const allStops = [aLineStop, anotherLineStop, yetAnotherLineStop, sourceLineStop, destinationLineStop];

        const traverser = DijkstraGraphTraverser.traverseWith(allStops, [sourceLineStop]);
        traverser.optionallySaveTimeToLineStop(aLineStop, sourceLineStop, 1);
        traverser.optionallySaveTimeToLineStop(anotherLineStop, aLineStop, 1);
        traverser.optionallySaveTimeToLineStop(yetAnotherLineStop, anotherLineStop, 1);
        traverser.optionallySaveTimeToLineStop(destinationLineStop, yetAnotherLineStop, 1);
        traverser.optionallySaveTimeToLineStop(destinationLineStop, anotherLineStop, 2);

        const route = this.routeCreator.createFrom([destinationLineStop], [sourceLineStop], traverser);

        expect(route).to.deep.equal([
            [sourceLineStop, aLineStop, anotherLineStop, yetAnotherLineStop, destinationLineStop],
            [sourceLineStop, aLineStop, anotherLineStop, destinationLineStop]
        ]);
    }

    @test
    public async shouldCreateRoutesWhenThereAreMultipleBranchesAvailable(): Promise<void> {
        const aLineStop = LineStopBuilder.withDefaults().build();
        const sourceLineStop = LineStopBuilder.withDefaults().build();
        const anotherLineStop = LineStopBuilder.withDefaults().build();
        const yetAnotherLineStop = LineStopBuilder.withDefaults().build();
        const destinationLineStop = LineStopBuilder.withDefaults().build();
        const allStops = [aLineStop, anotherLineStop, yetAnotherLineStop, sourceLineStop, destinationLineStop];

        const traverser = DijkstraGraphTraverser.traverseWith(allStops, [sourceLineStop]);
        traverser.optionallySaveTimeToLineStop(aLineStop, sourceLineStop, 1);
        traverser.optionallySaveTimeToLineStop(anotherLineStop, aLineStop, 1);
        traverser.optionallySaveTimeToLineStop(yetAnotherLineStop, anotherLineStop, 1);
        traverser.optionallySaveTimeToLineStop(destinationLineStop, yetAnotherLineStop, 1);
        traverser.optionallySaveTimeToLineStop(destinationLineStop, anotherLineStop, 2);
        traverser.optionallySaveTimeToLineStop(destinationLineStop, sourceLineStop, 4);

        const route = this.routeCreator.createFrom([destinationLineStop], [sourceLineStop], traverser);

        expect(route).to.deep.equal([
            [sourceLineStop, aLineStop, anotherLineStop, yetAnotherLineStop, destinationLineStop],
            [sourceLineStop, aLineStop, anotherLineStop, destinationLineStop],
            [sourceLineStop, destinationLineStop],
        ]);
    }

    @test
    public async shouldCreateRouteWithMultipleSourceStops(): Promise<void> {
        const aLineStop = LineStopBuilder.withDefaults().build();
        const sourceLineStop = LineStopBuilder.withDefaults().build();
        const anotherSourceLineStop = LineStopBuilder.withDefaults().build();
        const anotherLineStop = LineStopBuilder.withDefaults().build();
        const yetAnotherLineStop = LineStopBuilder.withDefaults().build();
        const destinationLineStop = LineStopBuilder.withDefaults().build();
        const allStops = [aLineStop, anotherLineStop, yetAnotherLineStop, sourceLineStop, anotherSourceLineStop, destinationLineStop];

        const traverser = DijkstraGraphTraverser.traverseWith(allStops, [sourceLineStop, anotherSourceLineStop]);
        traverser.optionallySaveTimeToLineStop(anotherSourceLineStop, sourceLineStop, 1);
        traverser.optionallySaveTimeToLineStop(aLineStop, anotherSourceLineStop, 1);
        traverser.optionallySaveTimeToLineStop(anotherLineStop, aLineStop, 1);
        traverser.optionallySaveTimeToLineStop(yetAnotherLineStop, anotherLineStop, 1);
        traverser.optionallySaveTimeToLineStop(destinationLineStop, yetAnotherLineStop, 1);

        const routes = this.routeCreator.createFrom([destinationLineStop], [sourceLineStop, anotherSourceLineStop], traverser);

        expect(routes[0].timeTaken).to.equal(4);
        expect(routes).to.deep.equal([new Route(4, anotherSourceLineStop, aLineStop, anotherLineStop, yetAnotherLineStop, destinationLineStop)]);
    }

    @test
    public async shouldOnlyCreateRoutesForTheStopsWithTheMinimumTimeTaken(): Promise<void> {
        const sourceStation = new Station('Source Station');
        const destinationStation = new Station('Destination Station');
        const aSourceStop = LineStopBuilder.withDefaults().stoppingAt(sourceStation).withCode('AA1').build();
        const aMiddleStop = LineStopBuilder.withDefaults().withCode('AA3').build();
        const aDestinationStop = LineStopBuilder.withDefaults().stoppingAt(destinationStation).withCode('AA5').build();
        const anotherDestinationStop = LineStopBuilder.withDefaults().stoppingAt(destinationStation).withCode('AA5').build();
        const allStops = [aSourceStop, aMiddleStop, aDestinationStop, anotherDestinationStop];

        const traverser = DijkstraGraphTraverser.traverseWith(allStops, [aSourceStop, aSourceStop]);
        traverser.optionallySaveTimeToLineStop(aMiddleStop, aSourceStop, 1);
        traverser.optionallySaveTimeToLineStop(aDestinationStop, aMiddleStop, 1);
        traverser.optionallySaveTimeToLineStop(anotherDestinationStop, aDestinationStop, 1);

        const routes = this.routeCreator.createFrom([aDestinationStop, anotherDestinationStop], [aSourceStop], traverser);

        expect(routes[0].timeTaken).to.equal(2);
        expect(routes).to.deep.equal([new Route(2, aSourceStop, aMiddleStop, aDestinationStop)]);
    }

    @test
    public async shouldReturnUniqueRoutes(): Promise<void> {
        const sourceStation = new Station('Source Station');
        const destinationStation = new Station('Destination Station');
        const aSourceStop = LineStopBuilder.withDefaults().stoppingAt(sourceStation).withCode('AA1').build();
        const aMiddleStop = LineStopBuilder.withDefaults().withCode('AA3').build();
        const aDestinationStop = LineStopBuilder.withDefaults().stoppingAt(destinationStation).withCode('AA5').build();
        const anotherDestinationStop = LineStopBuilder.withDefaults().stoppingAt(destinationStation).withCode('AA5').build();
        const allStops = [aSourceStop, aMiddleStop, aDestinationStop, anotherDestinationStop];

        const traverser = DijkstraGraphTraverser.traverseWith(allStops, [aSourceStop, aSourceStop]);
        traverser.optionallySaveTimeToLineStop(aMiddleStop, aSourceStop, 1);
        traverser.optionallySaveTimeToLineStop(aDestinationStop, aMiddleStop, 1);
        traverser.optionallySaveTimeToLineStop(anotherDestinationStop, aDestinationStop, 1);

        const routes = this.routeCreator.createFrom([aDestinationStop, anotherDestinationStop], [aSourceStop], traverser);

        expect(routes[0].timeTaken).to.equal(2);
        expect(routes).to.deep.equal([new Route(2, aSourceStop, aMiddleStop, aDestinationStop)]);
    }
}