import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {Station} from '../../../src/models/station';
import {LineStop} from '../../../src/models/line-stop';
import {GraphTraversalData} from '../../../src/models/router/graph-traversal-data';

@suite
class GraphTraversalDataSpec {
    @test
    public async shouldSetTimeTakenForStopWhenNoValueIsSet(): Promise<void> {
        const lineStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const viaStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const stopReachabilityData = new GraphTraversalData();
        stopReachabilityData.set(viaStop, {timeTaken: 0, previousStop: undefined});

        stopReachabilityData.setTimeTakenForNeighbour(lineStop, viaStop, 5);

        expect(stopReachabilityData.get(lineStop)).to.deep.equal({
            timeTaken: 5,
            previousStop: viaStop
        });
    }

    @test
    public async shouldUpdateTimeTakenForStopWhenAHigherValueForTimeTakenIsSet(): Promise<void> {
        const lineStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const viaStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const stopReachabilityData = new GraphTraversalData();
        stopReachabilityData.set(viaStop, {timeTaken: 0, previousStop: undefined});
        stopReachabilityData.set(lineStop, {timeTaken: 100, previousStop: undefined});

        stopReachabilityData.setTimeTakenForNeighbour(lineStop, viaStop, 5);

        expect(stopReachabilityData.get(lineStop)).to.deep.equal({
            timeTaken: 5,
            previousStop: viaStop
        });
    }

    @test
    public async shouldNotUpdateTimeTakenForStopWhenALowerValueForTimeTakenIsSet(): Promise<void> {
        const lineStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const viaStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const existingViaStop = new LineStop('Imaginary', new Station('An imaginary stations'), new Date('17 April 2010'));
        const stopReachabilityData = new GraphTraversalData();
        stopReachabilityData.set(viaStop, {timeTaken: 0, previousStop: undefined});
        stopReachabilityData.set(lineStop, {timeTaken: 5, previousStop: existingViaStop});

        stopReachabilityData.setTimeTakenForNeighbour(lineStop, viaStop, 100);

        expect(stopReachabilityData.get(lineStop)).to.deep.equal({
            timeTaken: 5,
            previousStop: existingViaStop
        });
    }

    @test
    public async shouldGetNearestUnvisitedStop(): Promise<void> {
        const firstStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const secondStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const thirdStop = new LineStop('CC3', new Station('Esplanade'), new Date('17 April 2010'));
        const unvisitedStops = new Set<LineStop>([firstStop, secondStop]);

        const stopReachabilityData = new GraphTraversalData();
        stopReachabilityData.set(firstStop, {timeTaken: 10, previousStop: undefined});
        stopReachabilityData.set(secondStop, {timeTaken: 200, previousStop: undefined});
        stopReachabilityData.set(thirdStop, {timeTaken: 4, previousStop: undefined});

        const result = stopReachabilityData.getNearestUnvisitedStop(unvisitedStops);

        expect(result).to.equal(firstStop);
    }

    @test
    public async shouldGetNearestUnvisitedStopAsUndefinedIfThereAreNoneAvailable(): Promise<void> {
        const firstStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const secondStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const thirdStop = new LineStop('CC3', new Station('Esplanade'), new Date('17 April 2010'));
        const unvisitedStops = new Set<LineStop>([]);

        const stopReachabilityData = new GraphTraversalData();
        stopReachabilityData.set(firstStop, {timeTaken: 10, previousStop: undefined});
        stopReachabilityData.set(secondStop, {timeTaken: 200, previousStop: undefined});
        stopReachabilityData.set(thirdStop, {timeTaken: 4, previousStop: undefined});

        const result = stopReachabilityData.getNearestUnvisitedStop(unvisitedStops);

        expect(result).to.be.undefined;
    }
}