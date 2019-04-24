import {expect} from 'chai';
import {Line} from '../../src/models/line';
import {suite, test} from 'mocha-typescript';
import {Lines} from '../../src/models/lines';
import {LineStopBuilder} from '../builders/line-stop.builder';
import {LinesRepository} from '../../src/repositories/lines-repository';

@suite
class LinesRepositorySpec {
    @test
    public async shouldSaveAndFindLines(): Promise<void> {
        const firstLine = new Line([LineStopBuilder.withDefaults().build(), LineStopBuilder.withDefaults().build()]);
        const secondLine = new Line([LineStopBuilder.withDefaults().build(), LineStopBuilder.withDefaults().build()]);
        const lines = new Lines([firstLine, secondLine]);

        const repository = new LinesRepository();
        repository.save(lines);
        const foundLines = repository.findAll();

        expect(foundLines).to.equal(lines);
    }
}