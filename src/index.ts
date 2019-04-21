require('reflect-metadata');

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
        .description('Find one or more routes between stations of the Singapore MRT')
        .action(async (source: string, destination: string) => {
            return await container.get(FindRouteCommand).execute(source, destination);
        });
    commander.parse(process.argv);
}

bootstrap();