import {expect} from 'chai';
import {first} from 'lodash';
import {suite, test} from 'mocha-typescript';
import {Line} from '../../../src/models/line';
import {Lines} from '../../../src/models/lines';
import {Station} from '../../../src/models/station';
import {LineStop} from '../../../src/models/line-stop';
import {LineStopBuilder} from '../../builders/line-stop.builder';
import {IntersectionLine} from '../../../src/models/intersection-line';
import {IntersectionLinesFactory} from '../../../src/services/routing/intersection-lines-factory';

@suite
class IntersectionLinesFactorySpec {
    private intersectionLinesFactory: IntersectionLinesFactory;

    public before(): void {
        this.intersectionLinesFactory = new IntersectionLinesFactory();
    }

    @test
    public async shouldAddIntersectionLinesForAllIntersections(): Promise<void> {
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
        const allStops = [...aLine.stops, ...anotherLine.stops, ...yetAnotherLine.stops];

        const createdIntersectionLines = await this.intersectionLinesFactory.create(allStops, 1);

        const expectedIntersectionLines = new Lines([
            IntersectionLine.create(aLine.stops[0], anotherLine.stops[0], 1),
            IntersectionLine.create(aLine.stops[0], yetAnotherLine.stops[0], 1),
            IntersectionLine.create(anotherLine.stops[0], yetAnotherLine.stops[0], 1)
        ]);
        expect(createdIntersectionLines).to.deep.equal(expectedIntersectionLines);
    }

    @test
    public async shouldNotAddIntersectionLinesForStopsWhichHaveNotOpenedYet(): Promise<void> {
        const intersectionStation = new Station('Dhoby Ghaut');
        const aLine = new Line([
            LineStopBuilder.withDefaults().stoppingAt(intersectionStation).withOpeningDate(new Date(2019, 2, 1)).build(),
            LineStopBuilder.withDefaults().build()
        ]);
        const anotherLine = new Line([
            LineStopBuilder.withDefaults().stoppingAt(intersectionStation).withOpeningDate(new Date(2018, 1, 1)).build(),
            LineStopBuilder.withDefaults().build()
        ]);
        const allStops = [...aLine.stops, ...anotherLine.stops];

        const createdIntersectionLines = await this.intersectionLinesFactory.create(allStops, 1);

        expect(createdIntersectionLines).to.have.lengthOf(1);
    }

    @test
    public async shouldAddIntersectionLinesWithLineChangingTime(): Promise<void> {
        const intersectionStation = new Station('Intersection Station');
        const aLine = new Line([
            LineStopBuilder.withDefaults().withCode('NS1').build(),
            LineStopBuilder.withDefaults().withCode('NS2').stoppingAt(intersectionStation).build()
        ]);
        const anotherLine = new Line([
            LineStopBuilder.withDefaults().withCode('CC1').build(),
            LineStopBuilder.withDefaults().withCode('CC2').stoppingAt(intersectionStation).build()
        ]);
        const allStops = [...aLine.stops, ...anotherLine.stops];

        const createdIntersectionLines = await this.intersectionLinesFactory.create(allStops, 15);

        const expectedIntersectionLine = IntersectionLine.create(aLine.stops[1], anotherLine.stops[1], 15);
        expect(createdIntersectionLines).to.have.lengthOf(1);
        expect(createdIntersectionLines).to.deep.equal(new Lines([expectedIntersectionLine]));
        expect(first([...createdIntersectionLines]).getTimeTakenBetweenStations()).to.equal(15);
    }
}