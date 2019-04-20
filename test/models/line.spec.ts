import {expect} from 'chai';
import {Line} from '../../src/models/line';
import {suite, test} from 'mocha-typescript';
import {Station} from '../../src/models/station';
import {LineStop} from '../../src/models/line-stop';
import {LineStopBuilder} from '../builders/line-stop.builder';

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

    @test
    public async shouldDetermineIfLineHasStop(): Promise<void> {
        const oneOfTheLineStops = LineStopBuilder.withDefaults().build();
        const line = new Line([
            LineStopBuilder.withDefaults().build(), oneOfTheLineStops, LineStopBuilder.withDefaults().build()
        ]);

        expect(line.hasStop(oneOfTheLineStops)).to.be.true;
        const totallyDifferentLineStop = LineStopBuilder.withDefaults().build();
        expect(line.hasStop(totallyDifferentLineStop)).to.be.false;
    }

    @test
    public async shouldHaveTimeBetweenStationsAsOne(): Promise<void> {
        expect(new Line([]).getTimeTakenBetweenStations()).to.equal(1);
    }
}