import {Container} from 'inversify';
import {buildProviderModule} from 'inversify-binding-decorators';
import {LinesRepository} from '../repositories/lines.repository';

export class ContainerBuilder {
    public static build(): Container {
        const container = new Container({autoBindInjectable: true});
        container.load(buildProviderModule());
        container.rebind<LinesRepository>(LinesRepository).toConstantValue(new LinesRepository());
        return container;
    }
}