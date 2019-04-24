import {Line} from '../src/models/line';
import {Lines} from '../src/models/lines';
import {suite, test} from 'mocha-typescript';
import {Application} from '../src/application';
import {LinesFactory} from '../src/lines-factory';
import {instance, mock, verify, when} from 'ts-mockito';
import {LineStopBuilder} from './builders/line-stop.builder';
import {LinesRepository} from '../src/repositories/lines.repository';

@suite
class ApplicationSpec {
    private application: Application;
    private linesFactory: LinesFactory;
    private linesRepository: LinesRepository;

    public before(): void {
        this.linesFactory = mock(LinesFactory);
        this.linesRepository = mock(LinesRepository);
        this.application = new Application(instance(this.linesFactory), instance(this.linesRepository));
    }

    @test
    public async shouldInvokeCreationOfLinesAndSaveLinesToLinesRepository(): Promise<void> {
        const lines = new Lines([new Line([LineStopBuilder.withDefaults().build()])]);
        when(this.linesFactory.create()).thenResolve(lines);

        await this.application.initialize();

        verify(this.linesRepository.save(lines)).once();
    }
}