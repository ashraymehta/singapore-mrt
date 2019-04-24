import {EOL} from 'os';
import {inject} from 'inversify';
import {provide} from 'inversify-binding-decorators';
import {FindRouteCommand} from './commands/find-route-command';
import {LinesRepository} from '../repositories/lines-repository';
import inquirer = require('inquirer');

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

@provide(InquirerBootstrapper)
export class InquirerBootstrapper {
    private readonly linesRepository: LinesRepository;
    private readonly findRouteCommand: FindRouteCommand;

    constructor(@inject(FindRouteCommand) findRouteCommand: FindRouteCommand, @inject(LinesRepository) linesRepository: LinesRepository) {
        this.linesRepository = linesRepository;
        this.findRouteCommand = findRouteCommand;
    }

    public async bootstrap(): Promise<void> {
        const answers = await inquirer.prompt<{ source: string, destination: string, startTime: string }>([<any>{
            name: 'source',
            message: 'Please enter the source station: ',
            type: 'autocomplete',
            source: (_: any, input: string) => this.findStation(input)
        }, <any>{
            name: 'destination',
            message: 'Please enter the destination station: ',
            type: 'autocomplete',
            source: (_: any, input: string) => this.findStation(input)
        }, <any>{
            name: 'startTime',
            message: 'Please enter the start time of the travel (YYYY-MM-DDThh:mm): ',
            type: 'input',
        }]);

        const results = await this.findRouteCommand.execute(answers.source, answers.destination, answers.startTime);
        console.log(results.join(EOL));
    }

    private async findStation(input: string): Promise<string[]> {
        const allStations = [...this.linesRepository.findAll().getAllStations()];
        const allStationNames = allStations.map(s => s.name);
        return allStationNames.filter(name => name.startsWith(input));
    }
}