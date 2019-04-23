import {inject} from 'inversify';
import {Application} from '../application';
import {provide} from 'inversify-binding-decorators';
import {CommanderBootstrapper} from './commander-bootstrapper';

@provide(Bootstrapper)
export class Bootstrapper {
    private readonly application: Application;
    private readonly commanderBootstrapper: CommanderBootstrapper;

    constructor(@inject(Application) application: Application, @inject(CommanderBootstrapper) commanderBootstrapper: CommanderBootstrapper) {
        this.commanderBootstrapper = commanderBootstrapper;
        this.application = application;
    }

    public async bootstrap(): Promise<void> {
        await this.application.initialize();
        await this.commanderBootstrapper.bootstrap();
    }
}