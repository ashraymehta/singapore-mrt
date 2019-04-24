import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {LineStopBuilder} from '../builders/line-stop.builder';
import {IntersectionLine} from '../../src/models/intersection-line';

@suite
class IntersectionLineSpec {
    @test
    public async shouldCreateAnIntersectionLineWithTwoLineStops(): Promise<void> {
        const intersectionLine = IntersectionLine.create(LineStopBuilder.withDefaults().build(), LineStopBuilder.withDefaults().build(), 1);

        expect(intersectionLine.getTimeTakenBetweenStations()).to.equal(1);
    }

    @test
    public async shouldTreatTwoIntersectionLinesAsSameIfTheyHaveTheSameStops(): Promise<void> {
        const oneStop = LineStopBuilder.withDefaults().build();
        const anotherStop = LineStopBuilder.withDefaults().build();
        const anIntersectionLine = IntersectionLine.create(oneStop, anotherStop, 1);
        const anotherIntersectionLine = IntersectionLine.create(oneStop, anotherStop, 1);

        expect(anIntersectionLine.isSame(anotherIntersectionLine)).to.be.true;
    }

    @test
    public async shouldTreatTwoIntersectionLinesAsSameIfTheyHaveTheSameStopsRegardlessOfTheOrder(): Promise<void> {
        const oneStop = LineStopBuilder.withDefaults().build();
        const anotherStop = LineStopBuilder.withDefaults().build();
        const anIntersectionLine = IntersectionLine.create(oneStop, anotherStop, 1);
        const anotherIntersectionLine = IntersectionLine.create(anotherStop, oneStop, 1);

        expect(anIntersectionLine.isSame(anotherIntersectionLine)).to.be.true;
    }
}