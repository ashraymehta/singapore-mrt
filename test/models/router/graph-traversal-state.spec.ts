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
        const stopReachabilityData = GraphTraversalState.start([], viaStop);

        stopReachabilityData.updateTimeTaken(lineStop, viaStop, 5);

        expect(stopReachabilityData.routeToStop.get(lineStop)).to.deep.equal({
            timeTaken: 5,
            previousStop: viaStop
        });
    }

    @test
    public async shouldUpdateTimeTakenForStopWhenAHigherValueForTimeTakenIsSet(): Promise<void> {
        const lineStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const viaStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const stopReachabilityData = GraphTraversalState.start([], viaStop);
        stopReachabilityData.updateTimeTaken(lineStop, viaStop, 100);

        stopReachabilityData.updateTimeTaken(lineStop, viaStop, 5);

        expect(stopReachabilityData.routeToStop.get(lineStop)).to.deep.equal({
            timeTaken: 5,
            previousStop: viaStop
        });
    }

    @test
    public async shouldNotUpdateTimeTakenForStopWhenALowerValueForTimeTakenIsSet(): Promise<void> {
        const lineStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const viaStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const existingViaStop = new LineStop('Imaginary', new Station('An imaginary stations'), new Date('17 April 2010'));
        const stopReachabilityData = GraphTraversalState.start([], existingViaStop);
        stopReachabilityData.updateTimeTaken(lineStop, existingViaStop, 5);
        stopReachabilityData.updateTimeTaken(viaStop, existingViaStop, 95);

        stopReachabilityData.updateTimeTaken(lineStop, viaStop, 100);

        expect(stopReachabilityData.routeToStop.get(lineStop)).to.deep.equal({
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
        const stopReachabilityData = GraphTraversalState.start(unvisitedStops, undefined);
        stopReachabilityData.updateTimeTaken(firstStop, undefined, 10);
        stopReachabilityData.updateTimeTaken(secondStop, undefined, 200);
        stopReachabilityData.updateTimeTaken(thirdStop, undefined, 4);

        const result = stopReachabilityData.getNearestUnvisitedStop();

        expect(result).to.equal(firstStop);
    }

    @test
    public async shouldGetNearestUnvisitedStopAsUndefinedIfThereAreNoneAvailable(): Promise<void> {
        const firstStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const secondStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const thirdStop = new LineStop('CC3', new Station('Esplanade'), new Date('17 April 2010'));

        const stopReachabilityData = GraphTraversalState.start([], undefined);
        stopReachabilityData.updateTimeTaken(firstStop, undefined, 10);
        stopReachabilityData.updateTimeTaken(secondStop, undefined, 200);
        stopReachabilityData.updateTimeTaken(thirdStop, undefined, 4);

        const result = stopReachabilityData.getNearestUnvisitedStop();

        expect(result).to.be.undefined;
    }
}