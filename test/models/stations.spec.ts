import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {Station} from '../../src/models/station';
import {Stations} from '../../src/models/stations';

@suite
class StationsSpec {
    @test
    public async shouldFindStationWithName(): Promise<void> {
        const hougang = new Station('Hougang');
        const buangkok = new Station('Buangkok');
        const punggol = new Station('Punggol');
        const stations = new Stations([hougang, buangkok, punggol]);

        const result = stations.findStationWithName('Buangkok');

        expect(result).to.equal(buangkok);
    }

    @test
    public async shouldReturnUndefinedIfNoStationWithNameIsFound(): Promise<void> {
        const hougang = new Station('Hougang');
        const buangkok = new Station('Buangkok');
        const punggol = new Station('Punggol');
        const stations = new Stations([hougang, buangkok, punggol]);

        const result = stations.findStationWithName('Dhoby Ghaut');

        expect(result).to.be.undefined;
    }
}