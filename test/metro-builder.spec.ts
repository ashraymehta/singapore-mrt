import {expect} from 'chai';
import {Line} from '../src/models/line';
import {Metro} from '../src/models/metro';
import {suite, test} from 'mocha-typescript';
import {instance, mock, when} from 'ts-mockito';
import {LineStop} from '../src/models/line-stop';
import {MetroBuilder} from '../src/metro-builder';
import {JSONFileReader} from '../src/utils/json-file-reader';
import {ConfigurationProvider} from '../src/providers/configuration-provider';

@suite
class MetroBuilderSpec {
    private reader: JSONFileReader;
    private metroBuilder: MetroBuilder;
    private configurationProvider: ConfigurationProvider;
    private static readonly StationsMapFilePath = '/a/good/file/path/stations-map.json';

    public before(): void {
        this.reader = mock(JSONFileReader);
        this.configurationProvider = mock(ConfigurationProvider);
        this.metroBuilder = new MetroBuilder(instance(this.reader), instance(this.configurationProvider));

        when(this.configurationProvider.providePathForStationsMapFile()).thenResolve(MetroBuilderSpec.StationsMapFilePath)
    }

    @test
    public async shouldBuildMetroFromTheStationsJSONWhenOnlyASingleLineIsPresent(): Promise<void> {
        when(this.reader.readFile(MetroBuilderSpec.StationsMapFilePath)).thenResolve([
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

        const metro = await this.metroBuilder.build();

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

    @test
    public async shouldBuildMetroFromTheStationsJSONWhenMultipleLinesArePresent(): Promise<void> {
        when(this.reader.readFile(MetroBuilderSpec.StationsMapFilePath)).thenResolve([
            {
                StationCode: "NS1",
                StationName: "Jurong East",
                OpeningDate: "10 March 1990"
            },
            {
                StationCode: "EW1",
                StationName: "Pasir Ris",
                OpeningDate: "16 December 1989"
            }
        ]);

        const metro = await this.metroBuilder.build();

        expect(metro).to.be.an.instanceOf(Metro);
        const expectedLines = [
            new Line([new LineStop('NS1', new Date('10 March 1990'))]),
            new Line([new LineStop('EW1', new Date('16 December 1989'))])
        ];
        const expectedMetro = new Metro(expectedLines);
        expect(metro).to.deep.equal(expectedMetro);
    }
}