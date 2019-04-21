import {Line} from '../src/models/line';
import {Metro} from '../src/models/metro';
import {Lines} from '../src/models/lines';
import {suite, test} from 'mocha-typescript';
import {Application} from '../src/application';
import {MetroBuilder} from '../src/metro-builder';
import {instance, mock, verify, when} from 'ts-mockito';
import {LineStopBuilder} from './builders/line-stop.builder';
import {LinesRepository} from '../src/repositories/lines.repository';

@suite
class ApplicationSpec {
    private application: Application;
    private metroBuilder: MetroBuilder;
    private linesRepository: LinesRepository;

    public before(): void {
        this.metroBuilder = mock(MetroBuilder);
        this.linesRepository = mock(LinesRepository);
        this.application = new Application(instance(this.metroBuilder), instance(this.linesRepository));
    }

    @test
    public async shouldBuildMetroAndSaveLinesToLinesRepository(): Promise<void> {
        const lines = new Lines([new Line([LineStopBuilder.withDefaults().build()])]);
        when(this.metroBuilder.build()).thenResolve(new Metro(lines));

        await this.application.initialize();

        verify(this.linesRepository.save(lines)).once();
    }
}