import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {Station} from '../../src/models/station';
import {LineStopBuilder} from '../builders/line-stop.builder';

@suite
class LineStopSpec {
    @test
    public async shouldDetermineIfLineStopIsForStation(): Promise<void> {
        const punggol = new Station('Punggol');
        const stop = LineStopBuilder.withDefaults().stoppingAt(punggol).build();

        expect(stop.isFor(punggol)).to.be.true;
        expect(stop.isFor(new Station(`Sengkang`))).to.be.false;
    }

    @test
    public async shouldDetermineIfLineStopWasOpenBeforeAProvidedDateForStation(): Promise<void> {
        const stop = LineStopBuilder.withDefaults().withOpeningDate(new Date('2019-01-01T00:00:00.000Z')).build();

        expect(stop.wasOpenedOnOrBefore(new Date("2019-02-01T00:00:00.000Z"))).to.be.true;
        expect(stop.wasOpenedOnOrBefore(new Date("2019-01-01T00:00:00.000Z"))).to.be.true;

        expect(stop.wasOpenedOnOrBefore(new Date("2018-12-31T21:59:59.999Z"))).to.be.false;
        expect(stop.wasOpenedOnOrBefore(new Date("2018-02-01T00:00:00.000Z"))).to.be.false;
    }
}