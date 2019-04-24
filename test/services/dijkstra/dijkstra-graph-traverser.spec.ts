import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {LineStop} from '../../../src/models/line-stop';
import {LineStopBuilder} from '../../builders/line-stop.builder';
import {DijkstraGraphTraverser} from '../../../src/services/dijkstra/dijkstra-graph-traverser';

@suite
class DijkstraGraphTraverserSpec {
    @test
    public async shouldInitializeRoutesToAllNodesToInfiniteDistance(): Promise<void> {
        const sourceStop = LineStopBuilder.withDefaults().build();
        const firstStop = LineStopBuilder.withDefaults().build();
        const secondStop = LineStopBuilder.withDefaults().build();

        const traversor = DijkstraGraphTraverser.traverseWith([firstStop, secondStop, sourceStop], [sourceStop]);

        const defaultRouteInformation = {
            timeTaken: Number.POSITIVE_INFINITY,
            previousStops: new Set<LineStop>()
        };
        expect(traversor.routeToLineStop.get(sourceStop)).to.deep.equal({timeTaken: 0, previousStops: new Set<LineStop>()});
        expect(traversor.routeToLineStop.get(firstStop)).to.deep.equal(defaultRouteInformation);
        expect(traversor.routeToLineStop.get(secondStop)).to.deep.equal(defaultRouteInformation);
    }

    @test
    public async shouldMarkAllNodesAsUnvisitedDuringInitialization(): Promise<void> {
        const sourceStop = LineStopBuilder.withDefaults().build();
        const firstStop = LineStopBuilder.withDefaults().build();
        const secondStop = LineStopBuilder.withDefaults().build();

        const traversor = DijkstraGraphTraverser.traverseWith([firstStop, secondStop, sourceStop], [sourceStop]);

        expect(traversor.unvisitedStops).to.have.lengthOf(3);
        expect([...traversor.unvisitedStops]).to.deep.equal([firstStop, secondStop, sourceStop]);
    }

    @test
    public async shouldTraverseUnvisitedNodesStartingWithTheSourceStop(): Promise<void> {
        const sourceStop = LineStopBuilder.withDefaults().build();
        const firstStop = LineStopBuilder.withDefaults().build();
        const secondStop = LineStopBuilder.withDefaults().build();
        const traversor = DijkstraGraphTraverser.traverseWith([firstStop, secondStop, sourceStop], [sourceStop]);

        const nextStop = traversor.moveToNext();

        expect(nextStop).to.equal(sourceStop);
    }

    @test
    public async shouldAcceptMultipleStopsAsSourceStopsMarkingTheDistanceToAllOfThemAsZero(): Promise<void> {
        const aSourceStop = LineStopBuilder.withDefaults().build();
        const anotherSourceStop = LineStopBuilder.withDefaults().build();
        const firstStop = LineStopBuilder.withDefaults().build();
        const secondStop = LineStopBuilder.withDefaults().build();
        const traversor = DijkstraGraphTraverser.traverseWith([firstStop, secondStop, aSourceStop], [aSourceStop, anotherSourceStop]);

        const nextStop = traversor.moveToNext();

        expect(nextStop).to.equal(aSourceStop);
        expect(traversor.routeToLineStop.get(aSourceStop)).to.deep.equal({
            timeTaken: 0,
            previousStops: new Set<LineStop>()
        });
        expect(traversor.routeToLineStop.get(anotherSourceStop)).to.deep.equal({
            timeTaken: 0,
            previousStops: new Set<LineStop>()
        });
    }

    @test
    public async shouldTraverseUnvisitedNodes(): Promise<void> {
        const sourceStop = LineStopBuilder.withDefaults().build();
        const firstStop = LineStopBuilder.withDefaults().build();
        const secondStop = LineStopBuilder.withDefaults().build();
        const traversor = DijkstraGraphTraverser.traverseWith([firstStop, secondStop, sourceStop], [sourceStop]);
        traversor.moveToNext();

        const nextStop = traversor.moveToNext();

        expect(nextStop).to.equal(firstStop);
    }

    @test
    public async shouldTraverseToTheStopWithTheMinimumTimeTaken(): Promise<void> {
        const sourceStop = LineStopBuilder.withDefaults().build();
        const firstStop = LineStopBuilder.withDefaults().build();
        const secondStop = LineStopBuilder.withDefaults().build();
        const traversor = DijkstraGraphTraverser.traverseWith([firstStop, secondStop, sourceStop], [sourceStop]);
        traversor.moveToNext();
        traversor.optionallySaveTimeToLineStop(secondStop, sourceStop, 2);

        const nextStop = traversor.moveToNext();

        expect(nextStop).to.equal(secondStop);
    }

    @test
    public async shouldUpdateTimeToLineStopIfItIsLowerThanTheCurrentTimeTaken(): Promise<void> {
        const sourceStop = LineStopBuilder.withDefaults().build();
        const firstStop = LineStopBuilder.withDefaults().build();
        const secondStop = LineStopBuilder.withDefaults().build();
        const traversor = DijkstraGraphTraverser.traverseWith([firstStop, secondStop, sourceStop], [sourceStop]);
        traversor.optionallySaveTimeToLineStop(secondStop, sourceStop, 5);
        traversor.optionallySaveTimeToLineStop(firstStop, sourceStop, 2);

        traversor.optionallySaveTimeToLineStop(secondStop, firstStop, 1);

        expect(traversor.routeToLineStop.get(secondStop).timeTaken).to.equal(3);
        expect(traversor.routeToLineStop.get(secondStop).previousStops).to.deep.equal(new Set([firstStop]));
    }

    @test
    public async shouldIgnoreTimeToLineStopIfItIsGreaterThanTheCurrentTimeTaken(): Promise<void> {
        const sourceStop = LineStopBuilder.withDefaults().build();
        const firstStop = LineStopBuilder.withDefaults().build();
        const secondStop = LineStopBuilder.withDefaults().build();
        const traversor = DijkstraGraphTraverser.traverseWith([firstStop, secondStop, sourceStop], [sourceStop]);
        traversor.optionallySaveTimeToLineStop(secondStop, sourceStop, 5);
        traversor.optionallySaveTimeToLineStop(firstStop, sourceStop, 2);

        traversor.optionallySaveTimeToLineStop(secondStop, firstStop, 10);

        expect(traversor.routeToLineStop.get(secondStop).timeTaken).to.equal(5);
        expect(traversor.routeToLineStop.get(secondStop).previousStops).to.deep.equal(new Set([sourceStop]));
    }

    @test
    public async shouldAddToExistingRouteTimeToLineStopIfItIsEqualToTheCurrentTimeTaken(): Promise<void> {
        const sourceStop = LineStopBuilder.withDefaults().build();
        const firstStop = LineStopBuilder.withDefaults().build();
        const secondStop = LineStopBuilder.withDefaults().build();
        const traversor = DijkstraGraphTraverser.traverseWith([firstStop, secondStop, sourceStop], [sourceStop]);
        traversor.optionallySaveTimeToLineStop(secondStop, sourceStop, 5);
        traversor.optionallySaveTimeToLineStop(firstStop, sourceStop, 2);

        traversor.optionallySaveTimeToLineStop(secondStop, firstStop, 3);

        expect(traversor.routeToLineStop.get(secondStop).timeTaken).to.equal(5);
        expect(traversor.routeToLineStop.get(secondStop).previousStops).to.deep.equal(new Set([sourceStop, firstStop]));
    }
}