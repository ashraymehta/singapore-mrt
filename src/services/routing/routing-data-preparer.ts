import {inject} from 'inversify';
import {Line} from '../../models/line';
import {Lines} from '../../models/lines';
import {Logger} from '../../utils/logger';
import {Station} from '../../models/station';
import {LineStop} from '../../models/line-stop';
import {provide} from 'inversify-binding-decorators';
import {clone, difference, flatten, remove, uniq} from 'lodash';
import {IntersectionLine} from '../../models/intersection-line';
import {ConfigurationProvider} from '../../providers/configuration-provider';

@provide(RoutingDataPreparer)
export class RoutingDataPreparer {
    private readonly configurationProvider: ConfigurationProvider;
    private readonly logger = Logger.for(RoutingDataPreparer.name);

    constructor(@inject(ConfigurationProvider) configurationProvider: ConfigurationProvider) {
        this.configurationProvider = configurationProvider;
    }

    public async prepare(lines: Lines, timeOfTravel?: Date): Promise<{ allLines: Lines; allStops: LineStop[] }> {
        const allLines = clone(lines);
        const allStops = allLines.getAllStops();
        const filteredStops = timeOfTravel ? allStops.filter(stop => stop.wasOpenedOnOrBefore(timeOfTravel)) : allStops;
        const stations = filteredStops.map(stop => stop.stoppingAt);

        if (timeOfTravel) {
            const timingsConfiguration = this.configurationProvider.provideLineTimingsConfiguration();
            const linesToBeRemoved: Line[] = [];
            allLines.forEach(line => {
                const lineConfiguration = timingsConfiguration.getLineConfiguration(line.code(), timeOfTravel);
                if (!lineConfiguration.isOperational) {
                    linesToBeRemoved.push(line);
                }
                line.setTimeTakenBetweenStations(lineConfiguration.timeTakenPerStationInMinutes);
            });

            linesToBeRemoved.forEach(line => {
                this.logger.log(`Removing line [${line.code()}] as it is non-operational at [${timeOfTravel}].`);
                remove(filteredStops, stop => line.hasStop(stop));
                return allLines.delete(line);
            });
        }

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