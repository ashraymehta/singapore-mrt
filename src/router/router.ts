import {Metro} from '../models/metro';
import {Station} from '../models/station';
import {LineStop} from '../models/line-stop';

export class Router {
    public async findRouteBetween(source: Station, destination: Station, metro: Metro): Promise<LineStop[]> {
        return [source.lineStops[0], destination.lineStops[0]];
    }
}