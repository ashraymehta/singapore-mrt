import {expect} from 'chai';
import {Line} from '../src/models/line';
import {Metro} from '../src/models/metro';
import {suite, test} from 'mocha-typescript';
import {Station} from '../src/models/station';
import {instance, mock, when} from 'ts-mockito';
import {Stations} from '../src/models/stations';
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
    public async shouldBuildMetroWhenOnlyASingleLineIsPresent(): Promise<void> {
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
        const jurongLineStop = new LineStop('NS1', new Date('10 March 1990'));
        const bukitBatokLineStop = new LineStop('NS2', new Date('10 March 1990'));
        const expectedLines = [new Line([jurongLineStop, bukitBatokLineStop])];
        const expectedStations = new Stations([
            new Station('Jurong East', [jurongLineStop]),
            new Station('Bukit Batok', [bukitBatokLineStop])
        ]);
        const expectedMetro = new Metro(expectedLines, expectedStations);
        expect(metro).to.deep.equal(expectedMetro);
    }

    @test
    public async shouldBuildMetroWhenMultipleLinesArePresent(): Promise<void> {
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
        const jurongLineStop = new LineStop('NS1', new Date('10 March 1990'));
        const pasirRisLineStop = new LineStop('EW1', new Date('16 December 1989'));
        const expectedLines = [new Line([jurongLineStop]), new Line([pasirRisLineStop])];
        const expectedMetro = new Metro(expectedLines, new Stations([
            new Station('Jurong East', [jurongLineStop]),
            new Station('Pasir Ris', [pasirRisLineStop])
        ]));
        expect(metro).to.deep.equal(expectedMetro);
    }

    @test
    public async shouldBuildMetroWithUniqueStationsWhenDuplicatesArePresentInDifferentLines(): Promise<void> {
        when(this.reader.readFile(MetroBuilderSpec.StationsMapFilePath)).thenResolve([
            {
                StationCode: "NE6",
                StationName: "Dhoby Ghaut",
                OpeningDate: "20 June 2003"
            },
            {
                StationCode: "CC1",
                StationName: "Dhoby Ghaut",
                OpeningDate: "17 April 2010"
            }
        ]);

        const metro = await this.metroBuilder.build();

        expect(metro).to.be.an.instanceOf(Metro);
        const dhobyGhautNELineStop = new LineStop('NE6', new Date('20 June 2003'));
        const dhobyGhautEWLineStop = new LineStop('CC1', new Date('17 April 2010'));
        const expectedLines = [new Line([dhobyGhautNELineStop]), new Line([dhobyGhautEWLineStop])];
        const expectedMetro = new Metro(expectedLines, new Stations([
            new Station('Dhoby Ghaut', [dhobyGhautNELineStop, dhobyGhautEWLineStop]),
        ]));
        expect(metro).to.deep.equal(expectedMetro);
    }
}