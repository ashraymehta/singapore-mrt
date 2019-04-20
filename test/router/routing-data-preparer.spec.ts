import {expect} from 'chai';
import {Line} from '../../src/models/line';
import {suite, test} from 'mocha-typescript';
import {Metro} from '../../src/models/metro';
import {Lines} from '../../src/models/lines';
import {Station} from '../../src/models/station';
import {Stations} from '../../src/models/stations';
import {LineStop} from '../../src/models/line-stop';
import {IntersectionLine} from '../../src/models/intersection-line';
import {RoutingDataPreparer} from '../../src/router/routing-data-preparer';

@suite
class RoutingDataPreparerSpec {
    private routingDataPreparer: RoutingDataPreparer;

    public before(): void {
        this.routingDataPreparer = new RoutingDataPreparer();
    }

    @test
    public async shouldGetLinesAndStopsFromMetro(): Promise<void> {
        const jurongEast = new Station('Jurong East');
        const bukitBatok = new Station('Bukit Batok');
        const harbourFront = new Station('HarbourFront');
        const aLine = new Line([
            new LineStop('NS1', jurongEast, new Date('10 March 1990')),
            new LineStop('NS2', bukitBatok, new Date('10 March 1990'))
        ]);
        const anotherLine = new Line([
            new LineStop('NE1', harbourFront, new Date('20 June 2003')),
        ]);
        const metro = new Metro([aLine, anotherLine], new Stations([jurongEast, bukitBatok, harbourFront]));

        const result = await this.routingDataPreparer.provide(metro);

        expect(result).to.deep.equal({
            allLines: new Lines([aLine, anotherLine]),
            allStops: [...aLine.stops, ...anotherLine.stops]
        });
    }

    @test
    public async shouldAddIntersectionLinesForAllIntersectionsInTheMetro(): Promise<void> {
        const brasBasah = new Station('Bras Basah');
        const dhobyGhaut = new Station('Dhoby Ghaut');
        const clarkeQuay = new Station('Clarke Quay');
        const aLine = new Line([
            new LineStop('NE6', dhobyGhaut, new Date('20 June 2003')),
            new LineStop('NE5', clarkeQuay, new Date('20 June 2003'))
        ]);
        const anotherLine = new Line([
            new LineStop('CC1', dhobyGhaut, new Date('17 April 2010')),
            new LineStop('CC2', brasBasah, new Date('17 April 2010')),
        ]);
        const yetAnotherLine = new Line([
            new LineStop('NS24', dhobyGhaut, new Date('12 December 1987'))
        ]);
        const metro = new Metro([aLine, anotherLine, yetAnotherLine], new Stations([dhobyGhaut, brasBasah, clarkeQuay]));

        const result = await this.routingDataPreparer.provide(metro);

        const expectedIntersectionLines = [
            IntersectionLine.create(aLine.stops[0], anotherLine.stops[0]),
            IntersectionLine.create(aLine.stops[0], yetAnotherLine.stops[0]),
            IntersectionLine.create(anotherLine.stops[0], aLine.stops[0]),
            IntersectionLine.create(anotherLine.stops[0], yetAnotherLine.stops[0]),
            IntersectionLine.create(yetAnotherLine.stops[0], aLine.stops[0]),
            IntersectionLine.create(yetAnotherLine.stops[0], anotherLine.stops[0]),
        ];
        expect(result).to.deep.equal({
            allLines: new Lines([aLine, anotherLine, yetAnotherLine, ...expectedIntersectionLines]),
            allStops: [...aLine.stops, ...anotherLine.stops, ...yetAnotherLine.stops]
        });
    }
}