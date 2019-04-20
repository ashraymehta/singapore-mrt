import {LineStop} from '../models/line-stop';
import {GraphTraversalState} from '../models/router/graph-traversal-state';

export class RouteCreator {
    public async createFrom(sourceStop: LineStop, destinationStop: LineStop, traversalState: GraphTraversalState): Promise<LineStop[][]> {
        let currentStop = destinationStop;
        const route: LineStop[] = [currentStop];
        while (currentStop !== sourceStop) {
            currentStop = traversalState.routeToStop.get(currentStop).previousStop;
            route.push(currentStop);
            if (currentStop === undefined) {
                return [];
            }
        }
        return [route.reverse()];
    }
}