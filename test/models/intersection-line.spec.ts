import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {LineStopBuilder} from '../builders/line-stop.builder';
import {IntersectionLine} from '../../src/models/intersection-line';

@suite
class IntersectionLineSpec {
    @test
    public async shouldHaveTimeBetweenStationsAsOne(): Promise<void> {
        const intersectionLine = IntersectionLine.create(LineStopBuilder.withDefaults().build(), LineStopBuilder.withDefaults().build());

        expect(intersectionLine.getTimeTakenBetweenStations()).to.equal(1);
    }
}