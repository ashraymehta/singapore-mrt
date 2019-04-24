import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {Line} from '../../../src/models/line';
import {instance, mock, when} from 'ts-mockito';
import {Lines} from '../../../src/models/lines';
import {Route} from '../../../src/models/route';
import {Station} from '../../../src/models/station';
import {LineStopBuilder} from '../../builders/line-stop.builder';
import {RoutingService} from '../../../src/services/routing.service';
import {RoutesCreator} from '../../../src/services/dijkstra/routes-creator';
import {LinesRepository} from '../../../src/repositories/lines.repository';
import {ConfigurationProvider} from '../../../src/providers/configuration-provider';
import {DijkstraDataPreparer} from '../../../src/services/dijkstra/dijkstra-data-preparer';
import {GraphTraversalManager} from '../../../src/services/dijkstra/graph-traversal-manager';
import {IntersectionLinesFactory} from '../../../src/services/factories/intersection-lines-factory';

@suite
class RoutingServiceIntegrationSpec {
    private router: RoutingService;
    private linesRepository: LinesRepository;

    public before(): void {
        this.linesRepository = mock(LinesRepository);
        this.router = new RoutingService(new DijkstraDataPreparer(new ConfigurationProvider(), new IntersectionLinesFactory()),
            new RoutesCreator(), new GraphTraversalManager(), instance(this.linesRepository));
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
        const firstStop = LineStopBuilder.withDefaults().build();
        const secondStop = LineStopBuilder.withDefaults().build();
        const thirdStop = LineStopBuilder.withDefaults().build();
        const fourthStop = LineStopBuilder.withDefaults().build();

        const aLine = new Line([firstStop, secondStop, thirdStop, fourthStop]);
        const anotherLine = new Line([firstStop, secondStop, fourthStop]);

        const lines = new Lines([aLine, anotherLine]);
        when(this.linesRepository.findAll()).thenReturn(lines);

        const route = await this.router.findRoutesBetween(firstStop.stoppingAt, fourthStop.stoppingAt);

        expect(route).to.deep.equal([new Route(3, firstStop, secondStop, fourthStop)]);
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

    @test
    public async shouldFindMultipleShortestRoutesWhenSourceAndDestinationBothAreIntersections(): Promise<void> {
        const sourceStation = new Station('Source Station');
        const destinationStation = new Station('Destination Station');
        const aSourceStop = LineStopBuilder.withDefaults().stoppingAt(sourceStation).withCode('AA1').build();
        const anotherSourceStop = LineStopBuilder.withDefaults().stoppingAt(sourceStation).withCode('AA2').build();
        const middleStop = LineStopBuilder.withDefaults().withCode('AA3').build();
        const anotherMiddleStop = LineStopBuilder.withDefaults().withCode('AA4').build();
        const aDestinationStop = LineStopBuilder.withDefaults().stoppingAt(destinationStation).withCode('AA5').build();
        const anotherDestinationStop = LineStopBuilder.withDefaults().stoppingAt(destinationStation).withCode('AA6').build();

        const lines = new Lines([new Line([aSourceStop, middleStop, aDestinationStop]),
            new Line([anotherSourceStop, anotherMiddleStop, anotherDestinationStop])]);
        when(this.linesRepository.findAll()).thenReturn(lines);

        const route = await this.router.findRoutesBetween(aSourceStop.stoppingAt, aDestinationStop.stoppingAt);

        expect(route).to.deep.equal([[aSourceStop, middleStop, aDestinationStop],
            [anotherSourceStop, anotherMiddleStop, anotherDestinationStop]]);
    }

    @test
    public async shouldFindTheShortestRouteWhenSourceIsAtAnIntersection(): Promise<void> {
        const intersection = new Station('Intersection Station');
        const aStopAtIntersection = LineStopBuilder.withDefaults().stoppingAt(intersection).build();
        const anotherStopAtIntersection = LineStopBuilder.withDefaults().stoppingAt(intersection).build();
        const destinationStop = LineStopBuilder.withDefaults().build();

        const lines = new Lines([new Line([aStopAtIntersection, LineStopBuilder.withDefaults().build()]),
            new Line([aStopAtIntersection, anotherStopAtIntersection, destinationStop])]);
        when(this.linesRepository.findAll()).thenReturn(lines);

        const routes = await this.router.findRoutesBetween(intersection, destinationStop.stoppingAt);

        expect(routes).to.deep.equal([[anotherStopAtIntersection, destinationStop]]);
    }
}