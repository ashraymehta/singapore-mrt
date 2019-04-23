import {EOL} from 'os';
import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {Route} from '../../src/models/route';
import {Routes} from '../../src/models/routes';
import {Station} from '../../src/models/station';
import {LineStopBuilder} from '../builders/line-stop.builder';

@suite
class RoutesSpec {
    @test
    public async shouldDescribeRoutesInOrderOfTheTimeTaken(): Promise<void> {
        const aRoute = new Route(12, LineStopBuilder.withDefaults().build(), LineStopBuilder.withDefaults().build());
        const anotherRoute = new Route(10, LineStopBuilder.withDefaults().build(), LineStopBuilder.withDefaults().build());
        const routes = new Routes(aRoute, anotherRoute);

        const stringRepresentation = routes.toString();

        expect(stringRepresentation).to.equal(anotherRoute.toString() + EOL + aRoute.toString());
    }

    @test
    public async shouldDescribeRoutesInOrderOfNumberOfStopsInCaseTheTimeIsTheSame(): Promise<void> {
        const intersection = new Station('Intersection');
        const aRoute = new Route(10, LineStopBuilder.withDefaults().build(), LineStopBuilder.withDefaults().build(),
            LineStopBuilder.withDefaults().build());
        const anotherRoute = new Route(10, LineStopBuilder.withDefaults().build(),
            LineStopBuilder.withDefaults().stoppingAt(intersection).build(), LineStopBuilder.withDefaults().stoppingAt(intersection).build());
        const routes = new Routes(aRoute, anotherRoute);

        const stringRepresentation = routes.toString();

        expect(stringRepresentation).to.equal(anotherRoute.toString() + EOL + aRoute.toString());
    }
}