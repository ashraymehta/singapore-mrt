import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {Station} from '../../src/models/station';
import {LineStop} from '../../src/models/line-stop';
import {LineStopBuilder} from '../builders/line-stop.builder';
import {GraphTraversalStateManager} from '../../src/router/graph-traversal-state-manager';

@suite
class GraphTraversalStateSpecManager {
    @test
    public async shouldSetTimeTakenForStopWhenNoValueIsSet(): Promise<void> {
        const lineStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const viaStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const traversalState = GraphTraversalStateManager.startTraversal([], viaStop);

        traversalState.updateTimeTaken(lineStop, viaStop, 5);

        expect(traversalState.routeToStop.get(lineStop)).to.deep.equal({
            timeTaken: 5,
            previousStops: [viaStop]
        });
    }

    @test
    public async shouldUpdateTimeTakenForStopWhenAHigherValueForTimeTakenIsSet(): Promise<void> {
        const lineStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const viaStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const traversalState = GraphTraversalStateManager.startTraversal([], viaStop);
        traversalState.updateTimeTaken(lineStop, viaStop, 100);

        traversalState.updateTimeTaken(lineStop, viaStop, 5);

        expect(traversalState.routeToStop.get(lineStop)).to.deep.equal({
            timeTaken: 5,
            previousStops: [viaStop]
        });
    }

    @test
    public async shouldAddToTheExistingPreviousLineStopsWhenAnEqualValueForTimeTakenIsSet(): Promise<void> {
        const lineStop = LineStopBuilder.withDefaults().build();
        const aViaStop = LineStopBuilder.withDefaults().build();
        const anotherViaStop = LineStopBuilder.withDefaults().build();
        const traversalState = GraphTraversalStateManager.startTraversal([], aViaStop);
        traversalState.updateTimeTaken(lineStop, aViaStop, 5);
        traversalState.updateTimeTaken(anotherViaStop, aViaStop, 0);

        traversalState.updateTimeTaken(lineStop, anotherViaStop, 5);

        expect(traversalState.routeToStop.get(lineStop)).to.deep.equal({
            timeTaken: 5,
            previousStops: [aViaStop, anotherViaStop]
        });
    }

    @test
    public async shouldNotUpdateTimeTakenForStopWhenALowerValueForTimeTakenIsSet(): Promise<void> {
        const lineStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const viaStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const existingViaStop = new LineStop('Imaginary', new Station('An imaginary stations'), new Date('17 April 2010'));
        const traversalState = GraphTraversalStateManager.startTraversal([], existingViaStop);
        traversalState.updateTimeTaken(lineStop, existingViaStop, 5);
        traversalState.updateTimeTaken(viaStop, existingViaStop, 95);

        traversalState.updateTimeTaken(lineStop, viaStop, 100);

        expect(traversalState.routeToStop.get(lineStop)).to.deep.equal({
            timeTaken: 5,
            previousStops: [existingViaStop]
        });
    }

    @test
    public async shouldGetNextStopAsTheSourceStopForTheFirstTime(): Promise<void> {
        const firstStop = LineStopBuilder.withDefaults().build();
        const secondStop = LineStopBuilder.withDefaults().build();
        const thirdStop = LineStopBuilder.withDefaults().build();
        const unvisitedStops = [secondStop, thirdStop];
        const traversalState = GraphTraversalStateManager.startTraversal(unvisitedStops, firstStop);

        const result = traversalState.getNextStop();

        expect(result).to.equal(firstStop);
    }

    @test
    public async shouldMoveToNextStop(): Promise<void> {
        const firstStop = LineStopBuilder.withDefaults().build();
        const secondStop = LineStopBuilder.withDefaults().build();
        const thirdStop = LineStopBuilder.withDefaults().build();
        const unvisitedStops = [secondStop, thirdStop];
        const traversalState = GraphTraversalStateManager.startTraversal(unvisitedStops, firstStop);

        const result = traversalState.moveToNext();

        expect(result).to.equal(firstStop);
    }

    @test
    public async shouldGetNextStopAsTheNearestUnvisitedStop(): Promise<void> {
        const firstStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const secondStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const thirdStop = new LineStop('CC3', new Station('Esplanade'), new Date('17 April 2010'));
        const unvisitedStops = [firstStop, secondStop];
        const traversalState = GraphTraversalStateManager.startTraversal(unvisitedStops, firstStop);
        traversalState.updateTimeTaken(secondStop, firstStop, 200);
        traversalState.updateTimeTaken(thirdStop, secondStop, 4);

        const result = traversalState.getNextStop();

        expect(result).to.equal(firstStop);
    }

    @test
    public async shouldGetNextStopAsUndefinedIfTheNearestUnvisitedStopHasTheMaximumTimeTakenValue(): Promise<void> {
        const firstStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const secondStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const unvisitedStops = [firstStop, secondStop];
        const traversalState = GraphTraversalStateManager.startTraversal(unvisitedStops, firstStop);
        traversalState.moveToNext();

        const result = traversalState.getNextStop();

        expect(result).to.be.undefined;
    }

    @test
    public async shouldGetNearestUnvisitedStopAsUndefinedIfThereAreNoneAvailable(): Promise<void> {
        const firstStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const secondStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const thirdStop = new LineStop('CC3', new Station('Esplanade'), new Date('17 April 2010'));

        const traversalState = GraphTraversalStateManager.startTraversal([], undefined);
        traversalState.updateTimeTaken(firstStop, undefined, 10);
        traversalState.updateTimeTaken(secondStop, undefined, 200);
        traversalState.updateTimeTaken(thirdStop, undefined, 4);

        const result = traversalState.getNextStop();

        expect(result).to.be.undefined;
    }

    @test
    public async shouldMarkStopAsVisited(): Promise<void> {
        const firstStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const secondStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));

        const traversalState = GraphTraversalStateManager.startTraversal([firstStop, secondStop], undefined);

        traversalState.markStopAsVisited(firstStop);

        expect(traversalState.unvisitedStops.has(firstStop)).to.be.false;
        expect(traversalState.unvisitedStops.has(secondStop)).to.be.true;
    }

    @test
    public async shouldStartTraversalByInitializingAllRouteToStopForAllNodes(): Promise<void> {
        const firstStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const secondStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const thirdStop = new LineStop('CC3', new Station('Esplanade'), new Date('17 April 2010'));

        const traversalState = GraphTraversalStateManager.startTraversal([firstStop, secondStop, thirdStop], firstStop);

        expect(traversalState.unvisitedStops).to.have.lengthOf(2);
        expect([...traversalState.unvisitedStops.values()]).to.deep.equal([secondStop, thirdStop]);

        expect(traversalState.routeToStop).to.have.lengthOf(3);
        expect(traversalState.routeToStop.get(firstStop)).to.deep.equal({
            timeTaken: 0,
            previousStops: []
        });
        expect(traversalState.routeToStop.get(secondStop)).to.deep.equal({
            timeTaken: Number.MAX_VALUE,
            previousStops: []
        });
        expect(traversalState.routeToStop.get(thirdStop)).to.deep.equal({
            timeTaken: Number.MAX_VALUE,
            previousStops: []
        });
    }

    @test
    public async shouldDetermineIfThereAreNextStopsToVisitWhenThereAreNoUnvisitedStops(): Promise<void> {
        const unvisitedStop = LineStopBuilder.withDefaults().build();
        const sourceStop = LineStopBuilder.withDefaults().build();
        const traversalState = GraphTraversalStateManager.startTraversal([unvisitedStop], sourceStop);
        expect(traversalState.hasNext()).to.be.true;

        const stop = traversalState.moveToNext();
        traversalState.markStopAsVisited(stop);

        expect(traversalState.hasNext()).to.be.false;
    }

    @test
    public async shouldDetermineIfThereAreNextStopsToVisitWhenUnvisitedStopsHaveAMaximumTimeTaken(): Promise<void> {
        const anUnvisitedStop = LineStopBuilder.withDefaults().build();
        const sourceStop = LineStopBuilder.withDefaults().build();
        const traversalState = GraphTraversalStateManager.startTraversal([anUnvisitedStop], sourceStop);
        traversalState.moveToNext();

        expect(traversalState.hasNext()).to.be.false;
    }
}