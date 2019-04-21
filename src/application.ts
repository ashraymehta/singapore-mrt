import {inject} from 'inversify';
import {Logger} from './utils/Logger';
import {MetroBuilder} from './metro-builder';
import {provide} from 'inversify-binding-decorators';
import {LinesRepository} from './repositories/lines.repository';

@provide(Application)
export class Application {
    private readonly metroBuilder: MetroBuilder;
    private readonly linesRepository: LinesRepository;
    private readonly logger = Logger.for(Application.name);

    constructor(@inject(MetroBuilder) metroBuilder: MetroBuilder, @inject(LinesRepository) linesRepository: LinesRepository) {
        this.metroBuilder = metroBuilder;
        this.linesRepository = linesRepository;
    }

    public async initialize(): Promise<void> {
        const metro = await this.metroBuilder.build();
        this.logger.log(`Built [${metro.lines.size}] metro lines.`);
        this.linesRepository.save(metro.lines);
    }
}