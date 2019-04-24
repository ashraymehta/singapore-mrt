import {expect} from 'chai';
import {Line} from '../src/models/line';
import {Lines} from '../src/models/lines';
import {suite, test} from 'mocha-typescript';
import {Station} from '../src/models/station';
import {instance, mock, when} from 'ts-mockito';
import {LineStop} from '../src/models/line-stop';
import {LinesFactory} from '../src/lines-factory';
import {JSONFileReader} from '../src/utils/json-file-reader';
import {ConfigurationProvider} from '../src/providers/configuration-provider';

@suite
class LinesFactorySpec {
    private static readonly StationsMapFilePath = '/a/good/file/path/stations-map.json';
    private reader: JSONFileReader;
    private metroBuilder: LinesFactory;
    private configurationProvider: ConfigurationProvider;

    public before(): void {
        this.reader = mock(JSONFileReader);
        this.configurationProvider = mock(ConfigurationProvider);
        this.metroBuilder = new LinesFactory(instance(this.reader), instance(this.configurationProvider));

        when(this.configurationProvider.providePathForStationsMapFile()).thenResolve(LinesFactorySpec.StationsMapFilePath)
    }

    @test
    public async shouldBuildMetroWhenOnlyASingleLineIsPresent(): Promise<void> {
        when(this.reader.readFile(LinesFactorySpec.StationsMapFilePath)).thenResolve([
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

        const lines = await this.metroBuilder.create();

        expect(lines).to.be.an.instanceOf(Lines);
        const jurongEastStation = new Station('Jurong East');
        const bukitBatokStation = new Station('Bukit Batok');
        const jurongLineStop = new LineStop('NS1', jurongEastStation, new Date('10 March 1990'));
        const bukitBatokLineStop = new LineStop('NS2', bukitBatokStation, new Date('10 March 1990'));
        const expectedLines = new Lines([new Line([jurongLineStop, bukitBatokLineStop])]);
        expect(lines).to.deep.equal(expectedLines);
    }

    @test
    public async shouldBuildMetroWhenMultipleLinesArePresent(): Promise<void> {
        when(this.reader.readFile(LinesFactorySpec.StationsMapFilePath)).thenResolve([
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

        const lines = await this.metroBuilder.create();

        const pasirRisStation = new Station('Pasir Ris');
        const jurongEastStation = new Station('Jurong East');
        const jurongLineStop = new LineStop('NS1', jurongEastStation, new Date('10 March 1990'));
        const pasirRisLineStop = new LineStop('EW1', pasirRisStation, new Date('16 December 1989'));
        const expectedLines = new Lines([new Line([jurongLineStop]), new Line([pasirRisLineStop])]);
        expect(lines).to.deep.equal(expectedLines);
    }

    @test
    public async shouldBuildMetroWithUniqueStationsWhenDuplicatesArePresentInDifferentLines(): Promise<void> {
        when(this.reader.readFile(LinesFactorySpec.StationsMapFilePath)).thenResolve([
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

        const lines = await this.metroBuilder.create();

        const dhobyGhautStation = new Station('Dhoby Ghaut');
        const dhobyGhautNELineStop = new LineStop('NE6', dhobyGhautStation, new Date('20 June 2003'));
        const dhobyGhautEWLineStop = new LineStop('CC1', dhobyGhautStation, new Date('17 April 2010'));
        const expectedLines = new Lines([new Line([dhobyGhautNELineStop]), new Line([dhobyGhautEWLineStop])]);
        expect(lines).to.deep.equal(expectedLines);
    }
}