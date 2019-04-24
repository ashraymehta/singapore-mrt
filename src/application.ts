import {inject} from 'inversify';
import {Logger} from './utils/logger';
import {LinesFactory} from './lines-factory';
import {provide} from 'inversify-binding-decorators';
import {LinesRepository} from './repositories/lines.repository';

@provide(Application)
export class Application {
    private readonly linesFactory: LinesFactory;
    private readonly linesRepository: LinesRepository;
    private readonly logger = Logger.for(Application.name);

    constructor(@inject(LinesFactory) linesFactory: LinesFactory, @inject(LinesRepository) linesRepository: LinesRepository) {
        this.linesFactory = linesFactory;
        this.linesRepository = linesRepository;
    }

    public async initialize(): Promise<void> {
        const lines = await this.linesFactory.create();
        this.logger.debug(`Built [${lines.size}] metro lines.`);
        this.linesRepository.save(lines);
    }
}