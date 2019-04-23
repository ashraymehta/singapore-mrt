import {EOL} from 'os';
import {Route} from './route';
import {orderBy} from 'lodash';

export class Routes extends Array<Route> {
    public toString(): string {
        return orderBy(this, [r => r.timeTaken, r => r.getStations().size])
            .map(route => route.toString()).join(EOL);
    }
}