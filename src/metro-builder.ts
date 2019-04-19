import {groupBy} from 'lodash';
import {Line} from './models/line';
import {Metro} from './models/metro';
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
        const stationsMap = await this.jsonFileReader.readFile(filePath) as UnparsedStationMap[];
        const stationsGroupedByLineCodes = groupBy(stationsMap, (station: UnparsedStationMap) => station.StationCode.substr(0, 2));

        const lines = Object.keys(stationsGroupedByLineCodes).map(lineCode => {
            const stopsForLine = stationsGroupedByLineCodes[lineCode] as UnparsedStationMap[];
            const stops = stopsForLine.map(station => new LineStop(station.StationCode, new Date(station.OpeningDate)));
            return new Line(stops);
        });

        return new Metro(lines);
    }
}