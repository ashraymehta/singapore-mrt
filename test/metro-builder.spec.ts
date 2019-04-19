import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {instance, mock, when} from 'ts-mockito';
import {MetroBuilder} from '../src/metro-builder';
import {Line, LineStop, Metro} from '../src/models/metro';
import {JSONFileReader} from '../src/utils/json-file-reader';

@suite
class MetroBuilderSpec {
    @test
    public async shouldBuildMetroFromTheStationsJSONWhenOnlyASingleLineIsPresent(): Promise<void> {
        const reader = mock(JSONFileReader);
        const metroBuilder = new MetroBuilder(instance(reader));
        when(reader.readFile('src/assets/stations-map.json')).thenResolve([
            {
                StationCode: "NS1",
                StationName: "Jurong East",
                OpeningDate: "10 March 1990"
            },
            {
                StationCode: "NS2",
                StationName: "Bukit Batok",
                OpeningDate: "10 March 1990"
            }
        ]);

        const metro = await metroBuilder.build();

        expect(metro).to.be.an.instanceOf(Metro);
        const expectedLines = [
            new Line([
                new LineStop('NS1', new Date('10 March 1990')),
                new LineStop('NS2', new Date('10 March 1990'))
            ])
        ];
        const expectedMetro = new Metro(expectedLines);
        expect(metro).to.deep.equal(expectedMetro);
    }
}