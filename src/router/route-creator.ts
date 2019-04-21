import {flatten} from 'lodash';
import {LineStop} from '../models/line-stop';
import {DijkstraGraphTraverser} from './dijkstra-graph-traverser';

export class RouteCreator {
    public createFrom(sourceStop: LineStop, destinationStop: LineStop, traversalState: DijkstraGraphTraverser): LineStop[][] {
        return this.findRoutes(destinationStop, sourceStop, traversalState).map(route => route.reverse());
    }

    private findRoutes(destinationStop: LineStop, sourceStop: LineStop, traversalState: DijkstraGraphTraverser): LineStop[][] {
        let currentStop = destinationStop;
        const route: LineStop[] = [];
        const routes = [];
        while (currentStop !== sourceStop) {
            route.push(currentStop);
            const previous = traversalState.routeToLineStop.get(currentStop).previousStops;
            if (previous.length === 1) {
                currentStop = previous[0];
            } else {
                const routesFromPrevious = flatten(previous.map(prev => this.findRoutes(prev, sourceStop, traversalState)))
                    .map(furtherPath => route.concat(furtherPath));
                routes.push(...routesFromPrevious);
                return routes;
            }
        }
        if (route) {
            route.push(sourceStop);
        }
        routes.push(route);
        return routes;
    }
}