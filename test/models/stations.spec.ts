import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {Station} from '../../src/models/station';
import {Stations} from '../../src/models/stations';
import {LineStop} from '../../src/models/line-stop';

@suite
class StationsSpec {
    @test
    public async shouldFindStationWithName(): Promise<void> {
        const hougang = new Station('Hougang', [new LineStop('NE14', new Date('20 June 2003'))]);
        const buangkok = new Station('Buangkok', [new LineStop('NE15', new Date('15 January 2006'))]);
        const punggol = new Station('Punggol', [new LineStop('NE17', new Date('20 June 2003'))]);
        const stations = new Stations([hougang, buangkok, punggol]);

        const result = stations.findStationWithName('Buangkok');

        expect(result).to.equal(buangkok);
    }

    @test
    public async shouldReturnUndefinedIfNoStationWithNameIsFound(): Promise<void> {
        const hougang = new Station('Hougang', [new LineStop('NE14', new Date('20 June 2003'))]);
        const buangkok = new Station('Buangkok', [new LineStop('NE15', new Date('15 January 2006'))]);
        const punggol = new Station('Punggol', [new LineStop('NE17', new Date('20 June 2003'))]);
        const stations = new Stations([hougang, buangkok, punggol]);

        const result = stations.findStationWithName('Dhoby Ghaut');

        expect(result).to.be.undefined;
    }

    @test
    public async shouldAddStationIfItDoesNotExist(): Promise<void> {
        const stations = new Stations();
        const stationName = 'Serangoon';
        const lineStop = new LineStop('CC13', new Date('28 May 2009'));

        stations.createOrUpdate(stationName, lineStop);

        expect(stations).to.have.lengthOf(1);
        const createdStation = [...stations][0];
        expect(createdStation).to.deep.equal(new Station(stationName, [lineStop]));
    }

    @test
    public async shouldAddLineStopToExistingStationIfItAlreadyExists(): Promise<void> {
        const stations = new Stations();
        const stationName = 'Serangoon';
        const newLineStop = new LineStop('CC13', new Date('28 May 2009'));
        const existingLineStop = new LineStop(`NE12`, new Date(`20 June 2003`));
        stations.add(new Station(stationName, [existingLineStop]));

        stations.createOrUpdate(stationName, newLineStop);

        expect(stations).to.have.lengthOf(1);
        const serangoonStation = [...stations][0];
        expect(serangoonStation).to.deep.equal(new Station(stationName, [existingLineStop, newLineStop]));
    }
}