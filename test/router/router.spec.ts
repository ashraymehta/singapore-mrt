import {expect} from 'chai';
import {Line} from '../../src/models/line';
import {suite, test} from 'mocha-typescript';
import {Metro} from '../../src/models/metro';
import {Router} from '../../src/router/router';
import {Station} from '../../src/models/station';
import {RouteCreator} from '../../src/router/route-creator';
import {LineStopBuilder} from '../builders/line-stop.builder';
import {RoutingDataPreparer} from '../../src/router/routing-data-preparer';
import {GraphTraversalStateManager} from '../../src/router/graph-traversal-state-manager';

@suite
class RouterSpec {
    private router: Router;

    public before(): void {
        this.router = new Router(new RoutingDataPreparer(), new RouteCreator(), new GraphTraversalStateManager());
    }

    @test
    public async shouldFindRouteBetweenStationsWhenMetroHasASingleLinePassingThroughThem(): Promise<void> {
        const firstStop = LineStopBuilder.withDefaults().build();
        const lastStop = LineStopBuilder.withDefaults().build();

        const lines = [new Line([firstStop, lastStop])];
        const metro = new Metro(lines, null);

        const route = await this.router.findRoutesBetween(firstStop.stoppingAt, lastStop.stoppingAt, metro);

        expect(route).to.deep.equal([[firstStop, lastStop]]);
    }

    @test
    public async shouldFindReverseRouteBetweenStationsWhenMetroHasASingleLinePassingThroughThem(): Promise<void> {
        const firstStop = LineStopBuilder.withDefaults().build();
        const lastStop = LineStopBuilder.withDefaults().build();

        const lines = [new Line([firstStop, lastStop])];
        const metro = new Metro(lines, null);

        const route = await this.router.findRoutesBetween(lastStop.stoppingAt, firstStop.stoppingAt, metro);

        expect(route).to.deep.equal([[lastStop, firstStop]]);
    }

    @test
    public async shouldFindRouteBetweenFirstAndLastStopForALine(): Promise<void> {
        const firstStop = LineStopBuilder.withDefaults().build();
        const middleStop = LineStopBuilder.withDefaults().build();
        const lastStop = LineStopBuilder.withDefaults().build();

        const lines = [new Line([firstStop, middleStop, lastStop])];
        const metro = new Metro(lines, null);

        const route = await this.router.findRoutesBetween(firstStop.stoppingAt, lastStop.stoppingAt, metro);

        expect(route).to.deep.equal([[firstStop, middleStop, lastStop]]);
    }

    @test
    public async shouldReturnAnEmptyRouteIfThereIsNoPathBetweenProvidedStations(): Promise<void> {
        const firstStop = LineStopBuilder.withDefaults().build();
        const secondStop = LineStopBuilder.withDefaults().build();
        const thirdStop = LineStopBuilder.withDefaults().build();
        const fourthStop = LineStopBuilder.withDefaults().build();

        const lines = [new Line([firstStop, secondStop]), new Line([thirdStop, fourthStop])];
        const metro = new Metro(lines, null);

        const route = await this.router.findRoutesBetween(firstStop.stoppingAt, fourthStop.stoppingAt, metro);

        expect(route).to.deep.equal([]);
    }

    @test
    public async shouldFindRoutesWhichRequireALineChange(): Promise<void> {
        const interchangeStation = new Station(`Interchange Station`);

        const firstStop = LineStopBuilder.withDefaults().withCode('CC1').build();
        const secondStop = LineStopBuilder.withDefaults().stoppingAt(interchangeStation).withCode('CC2').build();
        const thirdStop = LineStopBuilder.withDefaults().stoppingAt(interchangeStation).withCode('CL1').build();
        const lastStop = LineStopBuilder.withDefaults().withCode('CL2').build();

        const lines = [new Line([firstStop, secondStop]), new Line([thirdStop, lastStop])];
        const metro = new Metro(lines, null);

        const route = await this.router.findRoutesBetween(firstStop.stoppingAt, lastStop.stoppingAt, metro);

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

        const lines = [aLine, anotherLine];
        const metro = new Metro(lines, null);

        const route = await this.router.findRoutesBetween(firstStop.stoppingAt, fourthStop.stoppingAt, metro);

        expect(route).to.deep.equal([[firstStop, secondStop, fifthStop, fourthStop]]);
    }

    @test
    public async shouldFindMultipleShortestRoutesWhenAvailable(): Promise<void> {
        const firstStop = LineStopBuilder.withDefaults().withCode('AA1').build();
        const secondStop = LineStopBuilder.withDefaults().withCode('AA2').build();
        const thirdStop = LineStopBuilder.withDefaults().withCode('AA3').build();
        const fourthStop = LineStopBuilder.withDefaults().withCode('AA4').build();
        const fifthStop = LineStopBuilder.withDefaults().withCode('AA5').build();

        const lines = [new Line([firstStop, secondStop, thirdStop, fourthStop]),
            new Line([firstStop, secondStop, fifthStop, fourthStop])];
        const metro = new Metro(lines, null);

        const route = await this.router.findRoutesBetween(firstStop.stoppingAt, fourthStop.stoppingAt, metro);

        expect(route).to.deep.equal([[firstStop, secondStop, thirdStop, fourthStop],
            [firstStop, secondStop, fifthStop, fourthStop]]);
    }
}