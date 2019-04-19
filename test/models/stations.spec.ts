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
}