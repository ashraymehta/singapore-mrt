import {expect} from 'chai';
import {Line} from '../../src/models/line';
import {suite, test} from 'mocha-typescript';
import {Metro} from '../../src/models/metro';
import {Router} from '../../src/router/router';
import {Station} from '../../src/models/station';
import {Stations} from '../../src/models/stations';
import {LineStop} from '../../src/models/line-stop';
import {RouteCreator} from '../../src/router/route-creator';
import {LineStopBuilder} from '../builders/line-stop.builder';
import {RoutingDataPreparer} from '../../src/router/routing-data-preparer';

@suite
class RouterSpec {
    private router: Router;

    public before(): void {
        this.router = new Router(new RoutingDataPreparer(), new RouteCreator());
    }

    @test
    public async shouldFindRouteBetweenStationsWhenMetroHasASingleLinePassingThroughThem(): Promise<void> {
        const jurongEastStation = new Station(`Jurong East`);
        const bukitBatokStation = new Station(`Bukit Batok`);
        const jurongLineStop = new LineStop(`NS1`, jurongEastStation, new Date(`10 March 1990`));
        const bukitBatokLineStop = new LineStop(`NS2`, bukitBatokStation, new Date(`10 March 1990`));

        const lines = [new Line([jurongLineStop, bukitBatokLineStop])];
        const stations = new Stations([jurongEastStation, bukitBatokStation]);
        const metro = new Metro(lines, stations);

        const route = await this.router.findRoutesBetween(jurongEastStation, bukitBatokStation, metro);

        expect(route).to.deep.equal([[jurongLineStop, bukitBatokLineStop]]);
    }

    @test
    public async shouldFindReverseRouteBetweenStationsWhenMetroHasASingleLinePassingThroughThem(): Promise<void> {
        const jurongEastStation = new Station(`Jurong East`);
        const bukitBatokStation = new Station(`Bukit Batok`);
        const jurongEastLineStop = new LineStop(`NS1`, jurongEastStation, new Date(`10 March 1990`));
        const bukitBatokLineStop = new LineStop(`NS2`, bukitBatokStation, new Date(`10 March 1990`));

        const lines = [new Line([jurongEastLineStop, bukitBatokLineStop])];
        const stations = new Stations([jurongEastStation, bukitBatokStation]);
        const metro = new Metro(lines, stations);

        const route = await this.router.findRoutesBetween(bukitBatokStation, jurongEastStation, metro);

        expect(route).to.deep.equal([[bukitBatokLineStop, jurongEastLineStop]]);
    }

    @test
    public async shouldFindRouteBetweenFirstAndLastStopForALine(): Promise<void> {
        const firstStation = new Station(`Jurong East`);
        const middleStation = new Station(`Bukit Batok`);
        const lastStation = new Station(`Bukit Gombak`);

        const firstStop = new LineStop(`NS1`, firstStation, new Date(`10 March 1990`));
        const middleStop = new LineStop(`NS2`, middleStation, new Date(`10 March 1990`));
        const lastStop = new LineStop(`NS3`, lastStation, new Date(`10 March 1990`));

        const lines = [new Line([firstStop, middleStop, lastStop])];
        const stations = new Stations([firstStation, middleStation, lastStation]);
        const metro = new Metro(lines, stations);

        const route = await this.router.findRoutesBetween(firstStation, lastStation, metro);

        expect(route).to.deep.equal([[firstStop, middleStop, lastStop]]);
    }

    @test
    public async shouldReturnAnEmptyRouteIfThereIsNoPathBetweenProvidedStations(): Promise<void> {
        const firstStation = new Station(`Jurong East`);
        const middleStation = new Station(`Bukit Batok`);
        const lastStation = new Station(`Bukit Gombak`);

        const firstStop = new LineStop(`NS1`, firstStation, new Date(`10 March 1990`));
        const middleStop = new LineStop(`NS2`, middleStation, new Date(`10 March 1990`));
        const lastStop = new LineStop(`NS3`, lastStation, new Date(`10 March 1990`));

        const lines = [new Line([firstStop, middleStop]), new Line([lastStop])];
        const stations = new Stations([firstStation, middleStation, lastStation]);
        const metro = new Metro(lines, stations);

        const route = await this.router.findRoutesBetween(firstStation, lastStation, metro);

        expect(route).to.deep.equal([[]]);
    }

    @test
    public async shouldFindRoutesWhichRequireALineChange(): Promise<void> {
        const firstStation = new Station(`Punggol`);
        const interchangeStation = new Station(`Serangoon`);
        const lastStation = new Station(`Bartley`);

        const firstStop = new LineStop(`NE17`, firstStation, new Date(`20 June 2003`));
        const interchangeStopForNELine = new LineStop(`NE12`, interchangeStation, new Date(`28 May 2009`));
        const interchangeStopForCCLine = new LineStop(`CC13`, interchangeStation, new Date(`28 May 2009`));
        const lastStop = new LineStop(`CC12`, lastStation, new Date(`28 May 2009`));

        const lines = [new Line([firstStop, interchangeStopForNELine]), new Line([interchangeStopForCCLine, lastStop])];
        const stations = new Stations([firstStation, interchangeStation, lastStation]);
        const metro = new Metro(lines, stations);

        const route = await this.router.findRoutesBetween(firstStation, lastStation, metro);

        expect(route).to.deep.equal([[firstStop, interchangeStopForNELine, interchangeStopForCCLine, lastStop]]);
    }

    @test
    public async shouldFindMultipleShortestRoutesWhenAvailable(): Promise<void> {
        const firstStation = new Station(`Punggol`);
        const interchangeStation = new Station(`Serangoon`);
        const lastStation = new Station(`Bartley`);

        const firstStop = new LineStop(`NE17`, firstStation, new Date(`20 June 2003`));
        const interchangeStopForNELine = new LineStop(`NE12`, interchangeStation, new Date(`28 May 2009`));
        const interchangeStopForCCLine = new LineStop(`CC13`, interchangeStation, new Date(`28 May 2009`));
        const lastStop = new LineStop(`CC12`, lastStation, new Date(`28 May 2009`));

        const lines = [new Line([firstStop, interchangeStopForNELine]), new Line([interchangeStopForCCLine, lastStop])];
        const stations = new Stations([firstStation, interchangeStation, lastStation]);
        const metro = new Metro(lines, stations);

        const route = await this.router.findRoutesBetween(firstStation, lastStation, metro);

        expect(route).to.deep.equal([[firstStop, interchangeStopForNELine, interchangeStopForCCLine, lastStop]]);
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
}