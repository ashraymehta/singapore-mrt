import {inject} from 'inversify';
import {MetroBuilder} from './metro-builder';
import {provide} from 'inversify-binding-decorators';
import {LinesRepository} from './repositories/lines.repository';

@provide(Application)
export class Application {
    private readonly metroBuilder: MetroBuilder;
    private readonly linesRepository: LinesRepository;

    constructor(@inject(MetroBuilder) metroBuilder: MetroBuilder, @inject(LinesRepository) linesRepository: LinesRepository) {
        this.metroBuilder = metroBuilder;
        this.linesRepository = linesRepository;
    }

    public async initialize(): Promise<void> {
        const metro = await this.metroBuilder.build();
        this.linesRepository.save(metro.lines);
    }
}