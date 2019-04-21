import {MetroBuilder} from './metro-builder';
import {LinesRepository} from './repositories/lines.repository';

export class Application {
    private readonly metroBuilder: MetroBuilder;
    private readonly linesRepository: LinesRepository;

    constructor(metroBuilder: MetroBuilder, linesRepository: LinesRepository) {
        this.metroBuilder = metroBuilder;
        this.linesRepository = linesRepository;
    }

    public async initialize(): Promise<void> {
        const metro = await this.metroBuilder.build();
        this.linesRepository.save(metro.lines);
    }
}