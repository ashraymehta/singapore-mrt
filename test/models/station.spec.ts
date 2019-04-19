import {expect} from 'chai';
import {last} from 'lodash';
import {suite, test} from 'mocha-typescript';
import {Station} from '../../src/models/station';
import {LineStop} from '../../src/models/line-stop';

@suite
class StationSpec {
    @test
    public async shouldAddStopToStation(): Promise<void> {
        const station = new Station('Dhoby Ghaut', [
            new LineStop('NS24', new Date('12 December 1987')),
            new LineStop('NE6', new Date('20 June 2003')),
        ]);
        const latestDhobyGhautStop = new LineStop('CC1', new Date('17 April 2010'));

        station.addStop(latestDhobyGhautStop);

        expect(station.lineStops).has.lengthOf(3);
        expect(last(station.lineStops)).to.equal(latestDhobyGhautStop);
    }
}