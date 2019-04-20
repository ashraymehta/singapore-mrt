import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {Station} from '../../src/models/station';
import {LineStop} from '../../src/models/line-stop';

@suite
class LineStopSpec {
    @test
    public async shouldDetermineIfLineStopIsForStation(): Promise<void> {
        const punggol = new Station('Punggol');
        const stop = new LineStop(`NE17`, punggol, new Date('20 June 2003'));

        expect(stop.isFor(punggol)).to.be.true;
        expect(stop.isFor(new Station(`Sengkang`))).to.be.false;
    }
}