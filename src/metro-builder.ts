import {groupBy} from 'lodash';
import {Line} from './models/line';
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
        const unparsedStationsByLineCodes = groupBy(unparsedStationsMap, (station: UnparsedStationMap) => station.StationCode.substr(0, 2));

        const stations = new Stations();
        const lines = <Line[]>[];
        for (const lineCode in unparsedStationsByLineCodes) {
            const unparsedStopsForLine = unparsedStationsByLineCodes[lineCode] as UnparsedStationMap[];
            const stops = <LineStop[]>[];
            unparsedStopsForLine.forEach(station => {
                const lineStop = new LineStop(station.StationCode, new Date(station.OpeningDate));
                stops.push(lineStop);
                const parsedStation = stations.findStationWithName(station.StationName);
                if (parsedStation) {
                    parsedStation.addStop(lineStop);
                } else {
                    stations.add(new Station(station.StationName, [lineStop]));
                }
            });
            lines.push(new Line(stops));
        }

        return new Metro(lines, stations);
    }
}