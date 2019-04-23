import {Lines} from '../../models/lines';
import {Station} from '../../models/station';
import {LineStop} from '../../models/line-stop';
import {provide} from 'inversify-binding-decorators';
import {clone, difference, flatten, uniq} from 'lodash';
import {IntersectionLine} from '../../models/intersection-line';

@provide(RoutingDataPreparer)
export class RoutingDataPreparer {
    public async prepare(lines: Lines, timeOfJourney?: Date): Promise<{ allLines: Lines; allStops: LineStop[] }> {
        const allLines = clone(lines);
        const allStops = allLines.getAllStops();
        const filteredStops = timeOfJourney ? allStops.filter(stop => stop.wasOpenedOnOrBefore(timeOfJourney)) : allStops;
        const stations = filteredStops.map(stop => stop.stoppingAt);
        const intersectionLines = this.createIntersectionLines(stations, filteredStops);
        intersectionLines.forEach(line => allLines.add(line));
        return {allLines, allStops: filteredStops};
    }

    private createIntersectionLines(stations: Station[], stops: LineStop[]) {
        const duplicateStations = uniq(stations.filter((station: Station, index: number) => {
            return stations.indexOf(station, index + 1) > 0;
        }));
        return flatten(duplicateStations.map(station => {
            const stopsForStation = stops.filter(stop => stop.isFor(station));
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

            return uniqueIntersectionLines;
        }));
    }
}