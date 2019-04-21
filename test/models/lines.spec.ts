import {expect} from 'chai';
import {Line} from '../../src/models/line';
import {suite, test} from 'mocha-typescript';
import {Lines} from '../../src/models/lines';
import {Station} from '../../src/models/station';
import {LineStop} from '../../src/models/line-stop';
import {LineStopBuilder} from '../builders/line-stop.builder';

@suite
class LinesSpec {
    @test
    public async shouldGetStopsFromAllLines(): Promise<void> {
        const stopsForFirstLine = [
            new LineStop('CC1', new Station('Dhoby Ghaut'), new Date()),
            new LineStop('CC2', new Station('Bras Basah'), new Date())
        ];
        const stopsForSecondLine = [
            new LineStop('NE1', new Station('HarbourFront'), new Date()),
            new LineStop('NE3', new Station('Outram Park'), new Date())
        ];
        const lines = new Lines([new Line(stopsForFirstLine), new Line(stopsForSecondLine)]);

        const result = lines.getAllStops();

        expect(result).to.deep.equal([...stopsForFirstLine, ...stopsForSecondLine]);
    }

    @test
    public async shouldGetNeighbouringStops(): Promise<void> {
        const imaginaryStation = new Station('An imaginary station');
        const imaginaryLineStop = new LineStop('AB1', imaginaryStation, new Date());
        const firstNeighbourOfImaginaryStation = new LineStop('AB2', new Station(`I'm a station!`), new Date());
        const stopsForFirstLine = new Line([imaginaryLineStop, firstNeighbourOfImaginaryStation]);
        const stopsForSecondLine = new Line([
            new LineStop('AB0', new Station(`I'm a station far away from the imaginary station.`), new Date()),
            new LineStop('AB1', new Station(`I'm also one of the stations!`), new Date()),
            imaginaryLineStop,
            new LineStop('AB3', new Station(`I'm yet another stations!`), new Date())
        ]);
        const stopsForThirdLine = new Line([
            new LineStop('BD1', new Station(`I'm unrelated to the imaginary station.`), new Date()),
            new LineStop('BD2', new Station(`I'm unrelated to the imaginary station.`), new Date()),
            new LineStop('BD3', new Station(`I'm unrelated to the imaginary station.`), new Date())
        ]);
        const lines = new Lines([stopsForFirstLine, stopsForSecondLine, stopsForThirdLine]);

        const result = lines.getNeighbouringStopsFor(imaginaryLineStop);

        expect(result).to.deep.equal([firstNeighbourOfImaginaryStation, stopsForSecondLine.stops[1], stopsForSecondLine.stops[3]]);
    }

    @test
    public async shouldGetUniqueNeighbouringStops(): Promise<void> {
        const firstStop = LineStopBuilder.withDefaults().build();
        const secondStop = LineStopBuilder.withDefaults().build();
        const thirdStop = LineStopBuilder.withDefaults().build();
        const fourthStop = LineStopBuilder.withDefaults().build();
        const fifthStop = LineStopBuilder.withDefaults().build();

        const lines = new Lines([new Line([firstStop, secondStop, thirdStop, fourthStop, fifthStop]),
            new Line([firstStop, secondStop, fifthStop])]);

        const neighbouringStops = lines.getNeighbouringStopsFor(secondStop);

        expect(neighbouringStops).to.deep.equal([firstStop, thirdStop, fifthStop]);
    }
}