import {Lines} from '../../models/lines';
import {Station} from '../../models/station';
import {LineStop} from '../../models/line-stop';
import {provide} from 'inversify-binding-decorators';
import {difference, flatten, uniq, uniqWith} from 'lodash';
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
            const intersectionLines = flatten(stopsForStation.map(stop => {
                return difference(stopsForStation, [stop]).map(otherStop => {
                    return IntersectionLine.create(stop, otherStop, timeTakenForLineChange);
                });
            }));

            return uniqWith(intersectionLines, (anIntersectionLine: IntersectionLine, anotherIntersectionLine: IntersectionLine) => {
                return anIntersectionLine.isSame(anotherIntersectionLine);
            });
        }));

        return new Lines(intersectionLines);
    }
}