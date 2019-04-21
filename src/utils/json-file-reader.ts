import {readFile} from 'fs';
import {promisify} from 'util';
import {provide} from 'inversify-binding-decorators';

const readFileAsync = promisify<string, string, string>(readFile);

@provide(JSONFileReader)
export class JSONFileReader {
    public async readFile(filePath: string): Promise<unknown> {
        return JSON.parse(await readFileAsync(filePath, 'utf-8'));
    }
}