import {inject} from 'inversify';
import {Lines} from '../../models/lines';
import {Logger} from '../../utils/logger';
import {clone, remove, uniq} from 'lodash';
import {LineStop} from '../../models/line-stop';
import {provide} from 'inversify-binding-decorators';
import {IntersectionLinesFactory} from './intersection-lines-factory';
import {ConfigurationProvider} from '../../providers/configuration-provider';

@provide(RoutingDataPreparer)
export class RoutingDataPreparer {
    private readonly configurationProvider: ConfigurationProvider;
    private readonly logger = Logger.for(RoutingDataPreparer.name);
    private readonly intersectionLinesFactory: IntersectionLinesFactory;

    constructor(@inject(ConfigurationProvider) configurationProvider: ConfigurationProvider,
                @inject(IntersectionLinesFactory) intersectionLinesFactory: IntersectionLinesFactory) {
        this.configurationProvider = configurationProvider;
        this.intersectionLinesFactory = intersectionLinesFactory;
    }

    public async prepare(lines: Lines, timeOfTravel?: Date): Promise<{ allLines: Lines; allStops: LineStop[] }> {
        const allLines = clone(lines);
        const allStops = allLines.getAllStops();
        const filteredStops = timeOfTravel ? allStops.filter(stop => stop.wasOpenedOnOrBefore(timeOfTravel)) : allStops;
        const timingsConfiguration = this.configurationProvider.provideLineTimingsConfiguration();
        const timeTakenForLineChange = timeOfTravel ? timingsConfiguration.getTimeTakenForLineChange(timeOfTravel) : 1;

        if (timeOfTravel) {
            const operationalLines = [...allLines].filter(line => {
                return timingsConfiguration.getLineConfiguration(line.code(), timeOfTravel).isOperational;
            });
            const unoperationalLines = [...allLines].filter(line => {
                return !timingsConfiguration.getLineConfiguration(line.code(), timeOfTravel).isOperational;
            });

            operationalLines.forEach(line => {
                const timeTakenPerStation = timingsConfiguration.getLineConfiguration(line.code(), timeOfTravel).timeTakenPerStop;
                return line.setTimeTakenBetweenStations(timeTakenPerStation);
            });

            unoperationalLines.forEach(line => {
                this.logger.debug(`Removing line [${line.code()}] as it is non-operational at [${timeOfTravel}].`);
                remove(filteredStops, stop => line.hasStop(stop));
                return allLines.delete(line);
            });
        }

        const intersectionLines = this.intersectionLinesFactory.create(filteredStops, timeTakenForLineChange);
        intersectionLines.forEach(line => allLines.add(line));

        return {allLines, allStops: uniq(filteredStops)};
    }
}