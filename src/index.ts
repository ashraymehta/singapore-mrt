require('reflect-metadata');

import {Bootstrapper} from './console/bootstrapper';
import {ContainerBuilder} from './dependency-injection/container-builder';

const container = ContainerBuilder.build();
container.get(Bootstrapper).bootstrap();