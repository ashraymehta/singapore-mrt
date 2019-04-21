import commander = require('commander');

commander.command('route <source> <destination>', null, {isDefault: true})
    .description('Find one or more routes between stations of the Singapore MRT')
    .action((source, destination) => {
        console.log(`Source: ${source}`);
        console.log(`Destination: ${destination}`);
    });
commander.parse(process.argv);