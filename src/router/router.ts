import {Metro} from '../models/metro';
import {Station} from '../models/station';
import {LineStop} from '../models/line-stop';

export class Router {
    public async findRouteBetween(source: Station, destination: Station, metro: Metro): Promise<LineStop[]> {
        const line = metro.lines.find(line => line.stopsAt(source));
        return [line.findStopFor(source), line.findStopFor(destination)];
    }
}