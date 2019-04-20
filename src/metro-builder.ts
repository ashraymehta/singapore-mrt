import {Line} from './models/line';
import {groupBy, uniq} from 'lodash';
import {Metro} from './models/metro';
import {Station} from './models/station';
import {Stations} from './models/stations';
import {LineStop} from './models/line-stop';
import {JSONFileReader} from './utils/json-file-reader';
import {UnparsedStationMap} from './models/unparsed-station-map';
import {ConfigurationProvider} from './providers/configuration-provider';

export class MetroBuilder {
    private readonly jsonFileReader: JSONFileReader;
    private readonly configurationProvider: ConfigurationProvider;

    constructor(jsonFileReader: JSONFileReader, configurationProvider: ConfigurationProvider) {
        this.jsonFileReader = jsonFileReader;
        this.configurationProvider = configurationProvider;
    }

    public async build(): Promise<Metro> {
        const filePath = await this.configurationProvider.providePathForStationsMapFile();
        const unparsedStationsMap = await this.jsonFileReader.readFile(filePath) as UnparsedStationMap[];
        const unparsedStationsByLineCodes = groupBy(unparsedStationsMap, station => station.StationCode.substr(0, Line.LineCodeLength));
        const uniqueStationNames = uniq(unparsedStationsMap.map(n => n.StationName));
        const allStations = new Stations(uniqueStationNames.map(name => new Station(name)));

        const lines: Line[] = Object.keys(unparsedStationsByLineCodes).map(lineCode => {
            const unparsedStopsForLine = unparsedStationsByLineCodes[lineCode];
            const stops = unparsedStopsForLine.map(unparsedStation => {
                const station = allStations.findStationWithName(unparsedStation.StationName);
                return new LineStop(unparsedStation.StationCode, station, new Date(unparsedStation.OpeningDate));
            });
            return new Line(stops);
        });
        return new Metro(lines, allStations);
    }
}