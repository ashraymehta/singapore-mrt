import {Line, LineStop, Metro} from './models/metro';
import {JSONFileReader} from './utils/json-file-reader';

export class MetroBuilder {
    private readonly jsonFileReader: JSONFileReader;

    constructor(jsonFileReader: JSONFileReader) {
        this.jsonFileReader = jsonFileReader;
    }

    public async build(): Promise<any> {
        const stationsMap = await this.jsonFileReader.readFile(`src/assets/stations-map.json`) as object[];
        const stops = [];
        const line = new Line(stops);
        const lines = <Line[]>[line];
        stationsMap.forEach(station => stops.push(new LineStop(station['StationCode'], new Date(station['OpeningDate']))));
        return new Metro(lines);
    }
}