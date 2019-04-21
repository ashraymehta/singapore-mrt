require('reflect-metadata');
import commander = require('commander');
import {Application} from './application';
import {ContainerBuilder} from './dependency-injection/container-builder';

async function bootstrap() {
    const container = ContainerBuilder.build();
    const application = container.get(Application);
    await application.initialize();
    setupCommander();
}

function setupCommander() {
    commander.command('route <source> <destination>', null, {isDefault: true})
        .description('Find one or more routes between stations of the Singapore MRT')
        .action(async (source, destination) => {
            console.log(`Source: ${source}`);
            console.log(`Destination: ${destination}`);
        });
    commander.parse(process.argv);
}

bootstrap();