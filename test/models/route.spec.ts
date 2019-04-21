import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {Route} from '../../src/models/route';
import {Station} from '../../src/models/station';
import {LineStopBuilder} from '../builders/line-stop.builder';

@suite
class RouteSpec {
    @test
    public async shouldDescribeRoute(): Promise<void> {
        const botanicGardens = new Station('Botanic Gardens');
        const hollandVillageStop = LineStopBuilder.withDefaults().withCode('CC21').stoppingAt(new Station('Holland Village')).build();
        const farrerRoadStop = LineStopBuilder.withDefaults().withCode('CC20').stoppingAt(new Station('Farrer Road')).build();
        const botanicGardensStopForCircleLine = LineStopBuilder.withDefaults().withCode('CC19').stoppingAt(botanicGardens).build();
        const botanicGardensStopForDowntownLine = LineStopBuilder.withDefaults().withCode('DT9').stoppingAt(botanicGardens).build();
        const stevensStop = LineStopBuilder.withDefaults().withCode('DT10').stoppingAt(new Station('Stevens')).build();
        const route = new Route(hollandVillageStop, farrerRoadStop, botanicGardensStopForCircleLine, botanicGardensStopForDowntownLine, stevensStop);

        const routeDescription = route.describe();

        expect(routeDescription).to.deep.equal([
            'Take CC line from Holland Village to Farrer Road',
            'Take CC line from Farrer Road to Botanic Gardens',
            'Change from CC line to DT line',
            'Take DT line from Botanic Gardens to Stevens'
        ]);
    }
}