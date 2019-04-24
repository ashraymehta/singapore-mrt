import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {JSONFileReader} from '../../src/utils/json-file-reader';

@suite
class JsonFileReaderSpec {
    @test
    public async shouldReadJSONFile(): Promise<void> {
        const reader = new JSONFileReader();

        const result = await reader.readFile('test/assets/test-stations.json');

        expect(result).to.be.an.instanceOf(Object);
        expect(result).to.deep.equal([
            {
                StationCode: 'NS1',
                StationName: 'Jurong East',
                OpeningDate: '10 March 1990'
            },
            {
                StationCode: 'NS2',
                StationName: 'Bukit Batok',
                OpeningDate: '10 March 1990'
            }
        ]);
    }
}