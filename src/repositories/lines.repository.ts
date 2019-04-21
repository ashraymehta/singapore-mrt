import {Lines} from '../models/lines';

export class LinesRepository {
    private lines: Lines;

    public findAll(): Lines {
        return this.lines;
    }

    public save(lines: Lines): void {
        this.lines = lines;
    }
}