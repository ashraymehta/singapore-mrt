import {Container} from 'inversify';
import {buildProviderModule} from 'inversify-binding-decorators';

export class ContainerBuilder {
    public static build(): Container {
        const container = new Container({autoBindInjectable: true});
        container.load(buildProviderModule());
        return container;
    }
}