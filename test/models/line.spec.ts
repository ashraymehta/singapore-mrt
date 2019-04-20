import {expect} from 'chai';
import {Line} from '../../src/models/line';
import {suite, test} from 'mocha-typescript';
import {Station} from '../../src/models/station';
import {LineStop} from '../../src/models/line-stop';

@suite
class LineSpec {
    @test
    public async shouldFindStopForStation(): Promise<void> {
        const bukitBatokStation = new Station('Bukit Batok');
        const bukitBatokLineStop = new LineStop('NS2', bukitBatokStation, new Date('10 March 1990'));
        const line = new Line([
            new LineStop('NS1', new Station('Jurong East'), new Date('10 March 1990')), bukitBatokLineStop,
            new LineStop('NS3', new Station('Bukit Gombak'), new Date('10 March 1990'))
        ]);

        const result = line.findStopFor(bukitBatokStation);

        expect(result).to.deep.equal(bukitBatokLineStop);
    }

    @test
    public async shouldDetermineIfLineStopsAtStation(): Promise<void> {
        const bukitBatokStation = new Station('Bukit Batok');
        const bukitBatokLineStop = new LineStop('NS2', bukitBatokStation, new Date('10 March 1990'));
        const line = new Line([
            new LineStop('NS1', new Station('Jurong East'), new Date('10 March 1990')), bukitBatokLineStop,
            new LineStop('NS3', new Station('Bukit Gombak'), new Date('10 March 1990'))
        ]);

        expect(line.stopsAt(bukitBatokStation)).to.be.true;
        expect(line.stopsAt(new Station('Punggol'))).to.be.false;
    }
}