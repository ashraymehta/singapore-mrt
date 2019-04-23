import {inject} from 'inversify';
import {Route} from '../models/route';
import {Logger} from '../utils/Logger';
import {provide} from 'inversify-binding-decorators';
import {RoutingService} from '../services/routing.service';
import {LinesRepository} from '../repositories/lines.repository';
import moment = require('moment-timezone');

@provide(FindRouteCommand)
export class FindRouteCommand {
    private readonly routingService: RoutingService;
    private readonly linesRepository: LinesRepository;
    private readonly logger = Logger.for(FindRouteCommand.name);

    constructor(@inject(RoutingService) routingService: RoutingService,
                @inject(LinesRepository) linesRepository: LinesRepository) {
        this.routingService = routingService;
        this.linesRepository = linesRepository;
    }

    public async execute(source: string, destination: string, timeOfTravelAsString?: string): Promise<string[]> {
        this.logger.log(`Finding routes from [${source}] to [${destination}].`);
        const timeOfTravel = timeOfTravelAsString ? moment.tz(timeOfTravelAsString, 'YYYY-MM-DDThh:mm', 'Asia/Singapore').toDate() : undefined;
        const routes = await this.findRoutes(source, destination, timeOfTravel);
        return [`Found [${routes.length}] routes from [${source}] to [${destination}].`, '', ...routes.map(r => r.toString())];
    }

    private async findRoutes(source: string, destination: string, timeOfTravel?: Date): Promise<Route[]> {
        const lines = await this.linesRepository.findAll();
        this.logger.log(`Found [${lines.size}] lines from repository.`);
        const allStations = lines.getAllStations();
        const sourceStation = allStations.findStationWithName(source);
        const destinationStation = allStations.findStationWithName(destination);

        return await this.routingService.findRoutesBetween(sourceStation, destinationStation, timeOfTravel);
    }
}