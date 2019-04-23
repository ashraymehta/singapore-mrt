import {EOL} from "os";
import {inject} from 'inversify';
import {Command} from 'commander';
import {provide} from 'inversify-binding-decorators';
import {InquirerBootstrapper} from './inquirer-bootstrapper';
import {FindRouteCommand} from './commands/find-route-command';
import commander = require('commander');

@provide(CommanderBootstrapper)
export class CommanderBootstrapper {
    private readonly findRouteCommand: FindRouteCommand;
    private readonly inquirerBootstrapper: InquirerBootstrapper;

    constructor(@inject(FindRouteCommand) findRouteCommand: FindRouteCommand,
                @inject(InquirerBootstrapper) inquirerBootstrapper: InquirerBootstrapper) {
        this.inquirerBootstrapper = inquirerBootstrapper;
        this.findRouteCommand = findRouteCommand;
    }

    public async bootstrap(): Promise<void> {
        commander.command('route <source> <destination>', null, {isDefault: true})
            .option('-t, --start-time [startTime]', 'Start time of travel')
            .description('Find one or more routes between stations of the Singapore MRT')
            .action(async (source: string, destination: string, command: Command) => {
                const results = await this.findRouteCommand.execute(source, destination, command.startTime);
                console.log(results.join(EOL));
            });
        commander.parse(process.argv);

        const wasNoCommandSpecified = commander.args.length === 0;

        if (wasNoCommandSpecified) {
            await this.inquirerBootstrapper.bootstrap();
        }
    }
}