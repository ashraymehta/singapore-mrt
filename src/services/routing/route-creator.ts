import {flatten} from 'lodash';
import {LineStop} from '../../models/line-stop';
import {DijkstraGraphTraverser} from './dijkstra-graph-traverser';

export class RouteCreator {
    public createFrom(from: LineStop, to: LineStop, traversalState: DijkstraGraphTraverser): LineStop[][] {
        return this.findRoutes(from, to, traversalState).map(route => route.reverse());
    }

    private findRoutes(from: LineStop, to: LineStop, traversalState: DijkstraGraphTraverser): LineStop[][] {
        let currentStop = from;
        const route: LineStop[] = [];
        const routes = [];
        while (currentStop !== to) {
            route.push(currentStop);
            const previous = traversalState.routeToLineStop.get(currentStop).previousStops;
            if (previous.length === 1) {
                currentStop = previous[0];
            } else {
                const routesFromPrevious = flatten(previous.map(prev => this.findRoutes(prev, to, traversalState)))
                    .map(furtherPath => route.concat(furtherPath));
                routes.push(...routesFromPrevious);
                return routes;
            }
        }
        if (route) {
            route.push(to);
        }
        routes.push(route);
        return routes;
    }
}