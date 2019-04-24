import {inject} from 'inversify';
import {Line} from '../../models/line';
import {groupBy, uniq} from 'lodash';
import {Lines} from '../../models/lines';
import {Station} from '../../models/station';
import {Stations} from '../../models/stations';
import {LineStop} from '../../models/line-stop';
import {provide} from 'inversify-binding-decorators';
import {JSONFileReader} from '../../utils/json-file-reader';
import {UnparsedStationMap} from '../../models/unparsed-station-map';
import {ConfigurationProvider} from '../../providers/configuration-provider';

@provide(LinesFactory)
export class LinesFactory {
    private readonly jsonFileReader: JSONFileReader;
    private readonly configurationProvider: ConfigurationProvider;

    constructor(@inject(JSONFileReader) jsonFileReader: JSONFileReader,
                @inject(ConfigurationProvider) configurationProvider: ConfigurationProvider) {
        this.jsonFileReader = jsonFileReader;
        this.configurationProvider = configurationProvider;
    }

    public async create(): Promise<Lines> {
        const filePath = await this.configurationProvider.providePathForStationsMapFile();
        const unparsedStationsMap = await this.jsonFileReader.readFile(filePath) as UnparsedStationMap[];
        const unparsedStationsByLineCodes = groupBy(unparsedStationsMap, station => station.StationCode.substr(0, Line.LineCodeLength));
        const uniqueStationNames = uniq(unparsedStationsMap.map(n => n.StationName));
        const allStations = new Stations(uniqueStationNames.map(name => new Station(name)));

        const lines = Object.keys(unparsedStationsByLineCodes).map(lineCode => {
            const unparsedStopsForLine = unparsedStationsByLineCodes[lineCode];
            const stops = unparsedStopsForLine.map(unparsedStation => {
                const station = allStations.findStationWithName(unparsedStation.StationName);
                return new LineStop(unparsedStation.StationCode, station, new Date(unparsedStation.OpeningDate));
            });
            return new Line(stops);
        });
        return new Lines(lines);
    }
}