import {Lines} from '../models/lines';
import {provide} from 'inversify-binding-decorators';

@provide(LinesRepository)
export class LinesRepository {
    private lines: Lines;

    public findAll(): Lines {
        return this.lines;
    }

    public save(lines: Lines): void {
        this.lines = lines;
    }
}