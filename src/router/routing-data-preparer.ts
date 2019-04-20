import {Line} from '../models/line';
import {Metro} from '../models/metro';
import {Station} from '../models/station';
import {LineStop} from '../models/line-stop';
import {clone, difference, flatten, uniq} from 'lodash';
import {IntersectionLine} from '../models/intersection-line';

export class RoutingDataPreparer {
    public async provide(metro: Metro): Promise<{ allLines: Line[]; allStops: LineStop[] }> {
        const allLines = clone(metro.lines);
        const allStops = flatten(allLines.map(line => line.stops));
        const stations = allStops.map(stop => stop.stoppingAt);
        const duplicateStations = uniq(stations.filter((station: Station, index: number) => {
            return stations.indexOf(station, index + 1) > 0;
        }));
        duplicateStations.forEach(station => {
            const stopsForStation = allStops.filter(stop => stop.isFor(station));
            const lines = stopsForStation.map(stop => {
                return difference(stopsForStation, [stop]).map(otherStop => IntersectionLine.create(stop, otherStop));
            });
            allLines.push(...flatten(lines));
        });
        return {allLines, allStops};
    }
}