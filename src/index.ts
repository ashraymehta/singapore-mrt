require('reflect-metadata');

import {EOL} from 'os';
import {Command} from 'commander';
import {Application} from './application';
import {FindRouteCommand} from './commands/find-route-command';
import {ContainerBuilder} from './dependency-injection/container-builder';
import commander = require('commander');

const container = ContainerBuilder.build();

async function bootstrap() {
    const application = container.get(Application);
    await application.initialize();
    setupCommander();
}

function setupCommander() {
    commander.command('route <source> <destination>', null, {isDefault: true})
        .option('-t, --start-time [startTime]', 'Start time of travel')
        .description('Find one or more routes between stations of the Singapore MRT')
        .action(async (source: string, destination: string, command: Command) => {
            const results = await container.get(FindRouteCommand).execute(source, destination, command.startTime);
            console.log(results.join(EOL));
        });
    commander.parse(process.argv);
}

bootstrap();