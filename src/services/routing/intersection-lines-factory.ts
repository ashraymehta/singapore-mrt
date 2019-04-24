import {Lines} from '../../models/lines';
import {Station} from '../../models/station';
import {LineStop} from '../../models/line-stop';
import {difference, flatten, uniq} from 'lodash';
import {provide} from 'inversify-binding-decorators';
import {IntersectionLine} from '../../models/intersection-line';

@provide(IntersectionLinesFactory)
export class IntersectionLinesFactory {
    public create(stops: LineStop[], timeTakenForLineChange: number): Lines {
        const stations = stops.map(stop => stop.stoppingAt);
        const duplicateStations = uniq(stations.filter((station: Station, index: number) => {
            return stations.indexOf(station, index + 1) > 0;
        }));
        const intersectionLines = flatten(duplicateStations.map(station => {
            const stopsForStation = stops.filter(stop => stop.isFor(station));
            const lines = flatten(stopsForStation.map(stop => {
                return difference(stopsForStation, [stop]).map(otherStop => {
                    return IntersectionLine.create(stop, otherStop, timeTakenForLineChange);
                });
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

        return new Lines(intersectionLines);
    }
}