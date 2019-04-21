import {expect} from 'chai';
import {Line} from '../../src/models/line';
import {suite, test} from 'mocha-typescript';
import {Lines} from '../../src/models/lines';
import {Route} from '../../src/models/route';
import {instance, mock, when} from 'ts-mockito';
import {Station} from '../../src/models/station';
import {LineStopBuilder} from '../builders/line-stop.builder';
import {RoutingService} from '../../src/services/routing.service';
import {FindRouteCommand} from '../../src/commands/find-route-command';
import {LinesRepository} from '../../src/repositories/lines.repository';

@suite
class FindRouteCommandSpec {
    private command: FindRouteCommand;
    private routingService: RoutingService;
    private linesRepository: LinesRepository;

    public before(): void {
        this.routingService = mock(RoutingService);
        this.linesRepository = mock(LinesRepository);
        this.command = new FindRouteCommand(instance(this.routingService), instance(this.linesRepository));
    }

    @test
    public async shouldInvokeRoutingServiceToFindRoute(): Promise<void> {
        const sourceStation = new Station('Source Station');
        const destinationStation = new Station('Destination Station');
        const firstLine = new Line([
            LineStopBuilder.withDefaults().build(),
            LineStopBuilder.withDefaults().stoppingAt(sourceStation).build(),
            LineStopBuilder.withDefaults().build(),
        ]);
        const secondLine = new Line([
            LineStopBuilder.withDefaults().build(),
            LineStopBuilder.withDefaults().stoppingAt(destinationStation).build(),
            LineStopBuilder.withDefaults().build(),
        ]);
        const routes = [new Route(LineStopBuilder.withDefaults().withCode('CC1').build(),
            LineStopBuilder.withDefaults().withCode('DT1').build())];
        when(this.linesRepository.findAll()).thenReturn(new Lines([firstLine, secondLine]));
        when(this.routingService.findRoutesBetween(sourceStation, destinationStation)).thenResolve(routes);

        const results = await this.command.execute('Source Station', 'Destination Station');

        const expectedResult = [`Found [1] routes from [Source Station] to [Destination Station].`,
            '', routes[0].toString()];
        expect(results).to.deep.equal(expectedResult);
    }
}