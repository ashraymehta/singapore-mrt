import {groupBy} from 'lodash';
import {Line} from './models/line';
import {Metro} from './models/metro';
import {LineStop} from './models/line-stop';
import {JSONFileReader} from './utils/json-file-reader';

export class MetroBuilder {
    private readonly jsonFileReader: JSONFileReader;

    constructor(jsonFileReader: JSONFileReader) {
        this.jsonFileReader = jsonFileReader;
    }

    public async build(): Promise<any> {
        const stationsMap = await this.jsonFileReader.readFile(`src/assets/stations-map.json`) as UnparsedStationMap[];
        const stationsGroupedByLineCodes = groupBy(stationsMap, (station: UnparsedStationMap) => station.StationCode.substr(0, 2));

        const lines = Object.keys(stationsGroupedByLineCodes).map(lineCode => {
            const stopsForLine = stationsGroupedByLineCodes[lineCode] as UnparsedStationMap[];
            const stops = stopsForLine.map(station => new LineStop(station.StationCode, new Date(station.OpeningDate)));
            return new Line(stops);
        });

        return new Metro(lines);
    }
}

interface UnparsedStationMap {
    StationCode: string;
    StationName: string;
    OpeningDate: string;
}