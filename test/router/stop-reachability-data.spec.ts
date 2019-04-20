import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {Station} from '../../src/models/station';
import {LineStop} from '../../src/models/line-stop';
import {StopReachabilityData} from '../../src/models/router/stop-reachability-data';

@suite
class StopReachabilityDataSpec {
    @test
    public async shouldSetTimeTakenForStopWhenNoValueIsSet(): Promise<void> {
        const lineStop = new LineStop('CC1', new Station('Dhoby Ghaut'), new Date('17 April 2010'));
        const viaStop = new LineStop('CC2', new Station('Bras Basah'), new Date('17 April 2010'));
        const stopReachabilityData = new StopReachabilityData();
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
        const stopReachabilityData = new StopReachabilityData();
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
        const stopReachabilityData = new StopReachabilityData();
        stopReachabilityData.set(viaStop, {timeTaken: 0, previousStop: undefined});
        stopReachabilityData.set(lineStop, {timeTaken: 5, previousStop: existingViaStop});

        stopReachabilityData.setTimeTakenForNeighbour(lineStop, viaStop, 100);

        expect(stopReachabilityData.get(lineStop)).to.deep.equal({
            timeTaken: 5,
            previousStop: existingViaStop
        });
    }
}