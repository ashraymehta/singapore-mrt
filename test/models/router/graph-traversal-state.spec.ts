import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {Station} from '../../../src/models/station';
import {LineStop} from '../../../src/models/line-stop';
import {GraphTraversalState} from '../../../src/models/router/graph-traversal-state';

@suite
class GraphTraversalStateSpec {
    @test
    public async shouldSetTimeTakenForStopWhenNoValueIsSet(): Promise<void> {
        const lineStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const viaStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const traversalState = GraphTraversalState.start([], viaStop);

        traversalState.updateTimeTaken(lineStop, viaStop, 5);

        expect(traversalState.routeToStop.get(lineStop)).to.deep.equal({
            timeTaken: 5,
            previousStop: viaStop
        });
    }

    @test
    public async shouldUpdateTimeTakenForStopWhenAHigherValueForTimeTakenIsSet(): Promise<void> {
        const lineStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const viaStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const traversalState = GraphTraversalState.start([], viaStop);
        traversalState.updateTimeTaken(lineStop, viaStop, 100);

        traversalState.updateTimeTaken(lineStop, viaStop, 5);

        expect(traversalState.routeToStop.get(lineStop)).to.deep.equal({
            timeTaken: 5,
            previousStop: viaStop
        });
    }

    @test
    public async shouldNotUpdateTimeTakenForStopWhenALowerValueForTimeTakenIsSet(): Promise<void> {
        const lineStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const viaStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const existingViaStop = new LineStop('Imaginary', new Station('An imaginary stations'), new Date('17 April 2010'));
        const traversalState = GraphTraversalState.start([], existingViaStop);
        traversalState.updateTimeTaken(lineStop, existingViaStop, 5);
        traversalState.updateTimeTaken(viaStop, existingViaStop, 95);

        traversalState.updateTimeTaken(lineStop, viaStop, 100);

        expect(traversalState.routeToStop.get(lineStop)).to.deep.equal({
            timeTaken: 5,
            previousStop: existingViaStop
        });
    }

    @test
    public async shouldGetNearestUnvisitedStop(): Promise<void> {
        const firstStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const secondStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const thirdStop = new LineStop('CC3', new Station('Esplanade'), new Date('17 April 2010'));
        const unvisitedStops = [firstStop, secondStop];
        const traversalState = GraphTraversalState.start(unvisitedStops, undefined);
        traversalState.updateTimeTaken(firstStop, undefined, 10);
        traversalState.updateTimeTaken(secondStop, undefined, 200);
        traversalState.updateTimeTaken(thirdStop, undefined, 4);

        const result = traversalState.getNearestUnvisitedStop();

        expect(result).to.equal(firstStop);
    }

    @test
    public async shouldGetNearestUnvisitedStopAsUndefinedIfThereAreNoneAvailable(): Promise<void> {
        const firstStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const secondStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const thirdStop = new LineStop('CC3', new Station('Esplanade'), new Date('17 April 2010'));

        const traversalState = GraphTraversalState.start([], undefined);
        traversalState.updateTimeTaken(firstStop, undefined, 10);
        traversalState.updateTimeTaken(secondStop, undefined, 200);
        traversalState.updateTimeTaken(thirdStop, undefined, 4);

        const result = traversalState.getNearestUnvisitedStop();

        expect(result).to.be.undefined;
    }

    @test
    public async shouldMarkStopAsVisited(): Promise<void> {
        const firstStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const secondStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));

        const traversalState = GraphTraversalState.start([firstStop, secondStop], undefined);

        traversalState.markStopAsVisited(firstStop);

        expect(traversalState.unvisitedStops.has(firstStop)).to.be.false;
        expect(traversalState.unvisitedStops.has(secondStop)).to.be.true;
    }

    @test
    public async shouldStartTraversalByInitializingAllRouteToStopForAllNodes(): Promise<void> {
        const firstStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const secondStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const thirdStop = new LineStop('CC3', new Station('Esplanade'), new Date('17 April 2010'));

        const traversalState = GraphTraversalState.start([firstStop, secondStop, thirdStop], firstStop);

        expect(traversalState.unvisitedStops).to.have.lengthOf(2);
        expect([...traversalState.unvisitedStops.values()]).to.deep.equal([secondStop, thirdStop]);

        expect(traversalState.routeToStop).to.have.lengthOf(3);
        expect(traversalState.routeToStop.get(firstStop)).to.deep.equal({
            timeTaken: 0,
            previousStop: undefined
        });
        expect(traversalState.routeToStop.get(secondStop)).to.deep.equal({
            timeTaken: Number.MAX_VALUE,
            previousStop: undefined
        });
        expect(traversalState.routeToStop.get(thirdStop)).to.deep.equal({
            timeTaken: Number.MAX_VALUE,
            previousStop: undefined
        });
    }
}