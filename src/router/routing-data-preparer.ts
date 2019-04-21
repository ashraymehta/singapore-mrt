import {Metro} from '../models/metro';
import {Lines} from '../models/lines';
import {Station} from '../models/station';
import {LineStop} from '../models/line-stop';
import {clone, difference, flatten, uniq} from 'lodash';
import {IntersectionLine} from '../models/intersection-line';

export class RoutingDataPreparer {
    public async prepare(metro: Metro): Promise<{ allLines: Lines; allStops: LineStop[] }> {
        const allLines = clone(metro.lines);
        const allStops = allLines.getAllStops();
        const stations = allStops.map(stop => stop.stoppingAt);
        const duplicateStations = uniq(stations.filter((station: Station, index: number) => {
            return stations.indexOf(station, index + 1) > 0;
        }));
        duplicateStations.forEach(station => {
            const stopsForStation = allStops.filter(stop => stop.isFor(station));
            const lines = flatten(stopsForStation.map(stop => {
                return difference(stopsForStation, [stop]).map(otherStop => IntersectionLine.create(stop, otherStop));
            }));

            const uniqueIntersectionLines = lines.filter((line: IntersectionLine, index: number) => {
                const firstStop = line.stops[0];
                const secondStop = line.stops[1];
                const isThereADuplicateIntersectionLineBeforeThisInTheArray = lines.slice(0, index)
                    .find(aLine => aLine.hasStop(firstStop) && aLine.hasStop(secondStop));

                return !isThereADuplicateIntersectionLineBeforeThisInTheArray;
            });

            uniqueIntersectionLines.forEach(line => allLines.add(line));
        });
        return {allLines, allStops};
    }
}