import {expect} from 'chai';
import {instance, mock, when} from 'ts-mockito';
import {suite, test} from 'mocha-typescript';
import {Line} from '../../../src/models/line';
import {Lines} from '../../../src/models/lines';
import {Station} from '../../../src/models/station';
import {LineStopBuilder} from '../../builders/line-stop.builder';
import {RoutingService} from '../../../src/services/routing.service';
import {RouteCreator} from '../../../src/services/routing/route-creator';
import {LinesRepository} from '../../../src/repositories/lines.repository';
import {ConfigurationProvider} from '../../../src/providers/configuration-provider';
import {RoutingDataPreparer} from '../../../src/services/routing/routing-data-preparer';
import {GraphTraversalManager} from '../../../src/services/routing/graph-traversal-manager';

@suite
class RoutingServiceIntegrationSpec {
    private router: RoutingService;
    private linesRepository: LinesRepository;

    public before(): void {
        this.linesRepository = mock(LinesRepository);
        this.router = new RoutingService(new RoutingDataPreparer(new ConfigurationProvider()), new RouteCreator(),
            new GraphTraversalManager(), instance(this.linesRepository));
    }

    @test
    public async shouldFindRouteBetweenStationsWhenMetroHasASingleLinePassingThroughThem(): Promise<void> {
        const firstStop = LineStopBuilder.withDefaults().build();
        const lastStop = LineStopBuilder.withDefaults().build();

        const lines = new Lines([new Line([firstStop, lastStop])]);
        when(this.linesRepository.findAll()).thenReturn(lines);

        const route = await this.router.findRoutesBetween(firstStop.stoppingAt, lastStop.stoppingAt);

        expect(route).to.deep.equal([[firstStop, lastStop]]);
    }

    @test
    public async shouldFindReverseRouteBetweenStationsWhenMetroHasASingleLinePassingThroughThem(): Promise<void> {
        const firstStop = LineStopBuilder.withDefaults().build();
        const lastStop = LineStopBuilder.withDefaults().build();
        const lines = new Lines([new Line([firstStop, lastStop])]);
        when(this.linesRepository.findAll()).thenReturn(lines);

        const route = await this.router.findRoutesBetween(lastStop.stoppingAt, firstStop.stoppingAt);

        expect(route).to.deep.equal([[lastStop, firstStop]]);
    }

    @test
    public async shouldFindRouteBetweenFirstAndLastStopForALine(): Promise<void> {
        const firstStop = LineStopBuilder.withDefaults().build();
        const middleStop = LineStopBuilder.withDefaults().build();
        const lastStop = LineStopBuilder.withDefaults().build();
        const lines = new Lines([new Line([firstStop, middleStop, lastStop])]);
        when(this.linesRepository.findAll()).thenReturn(lines);

        const route = await this.router.findRoutesBetween(firstStop.stoppingAt, lastStop.stoppingAt);

        expect(route).to.deep.equal([[firstStop, middleStop, lastStop]]);
    }

    @test
    public async shouldReturnAnEmptyRouteIfThereIsNoPathBetweenProvidedStations(): Promise<void> {
        const firstStop = LineStopBuilder.withDefaults().build();
        const secondStop = LineStopBuilder.withDefaults().build();
        const thirdStop = LineStopBuilder.withDefaults().build();
        const fourthStop = LineStopBuilder.withDefaults().build();
        const lines = new Lines([new Line([firstStop, secondStop]), new Line([thirdStop, fourthStop])]);
        when(this.linesRepository.findAll()).thenReturn(lines);

        const route = await this.router.findRoutesBetween(firstStop.stoppingAt, fourthStop.stoppingAt);

        expect(route).to.deep.equal([]);
    }

    @test
    public async shouldFindRoutesWhichRequireALineChange(): Promise<void> {
        const interchangeStation = new Station(`Interchange Station`);

        const firstStop = LineStopBuilder.withDefaults().withCode('CC1').build();
        const secondStop = LineStopBuilder.withDefaults().stoppingAt(interchangeStation).withCode('CC2').build();
        const thirdStop = LineStopBuilder.withDefaults().stoppingAt(interchangeStation).withCode('CL1').build();
        const lastStop = LineStopBuilder.withDefaults().withCode('CL2').build();

        const lines = new Lines([new Line([firstStop, secondStop]), new Line([thirdStop, lastStop])]);
        when(this.linesRepository.findAll()).thenReturn(lines);

        const route = await this.router.findRoutesBetween(firstStop.stoppingAt, lastStop.stoppingAt);

        expect(route).to.deep.equal([[firstStop, secondStop, thirdStop, lastStop]]);
    }

    @test
    public async shouldFindShortestRouteWhenMultipleRoutesAreAvailable(): Promise<void> {
        const interchangeStation = new Station('Common Station');
        const firstStop = LineStopBuilder.withDefaults().build();
        const secondStop = LineStopBuilder.withDefaults().stoppingAt(interchangeStation).build();
        const thirdStop = LineStopBuilder.withDefaults().build();
        const fourthStop = LineStopBuilder.withDefaults().build();
        const fifthStop = LineStopBuilder.withDefaults().stoppingAt(interchangeStation).build();

        const aLine = new Line([firstStop, secondStop, thirdStop, fourthStop]);
        const anotherLine = new Line([fourthStop, fifthStop]);

        const lines = new Lines([aLine, anotherLine]);
        when(this.linesRepository.findAll()).thenReturn(lines);

        const route = await this.router.findRoutesBetween(firstStop.stoppingAt, fourthStop.stoppingAt);

        expect(route).to.deep.equal([[firstStop, secondStop, fifthStop, fourthStop]]);
    }

    @test
    public async shouldFindMultipleShortestRoutesWhenAvailable(): Promise<void> {
        const firstStop = LineStopBuilder.withDefaults().withCode('AA1').build();
        const secondStop = LineStopBuilder.withDefaults().withCode('AA2').build();
        const thirdStop = LineStopBuilder.withDefaults().withCode('AA3').build();
        const fourthStop = LineStopBuilder.withDefaults().withCode('AA4').build();
        const fifthStop = LineStopBuilder.withDefaults().withCode('AA5').build();

        const lines = new Lines([new Line([firstStop, secondStop, thirdStop, fourthStop]),
            new Line([firstStop, secondStop, fifthStop, fourthStop])]);
        when(this.linesRepository.findAll()).thenReturn(lines);

        const route = await this.router.findRoutesBetween(firstStop.stoppingAt, fourthStop.stoppingAt);

        expect(route).to.deep.equal([[firstStop, secondStop, thirdStop, fourthStop],
            [firstStop, secondStop, fifthStop, fourthStop]]);
    }
}