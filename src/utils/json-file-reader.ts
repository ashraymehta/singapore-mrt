import {readFile} from 'fs';
import {promisify} from 'util';
const readFileAsync = promisify<string, string, string>(readFile);

export class JSONFileReader {
    public async readFile(filePath: string): Promise<unknown> {
        return JSON.parse(await readFileAsync(filePath, 'utf-8'));
    }
}