import {flatten} from 'lodash';
import {Route} from '../../models/route';
import {LineStop} from '../../models/line-stop';
import {provide} from 'inversify-binding-decorators';
import {DijkstraGraphTraverser} from './dijkstra-graph-traverser';

@provide(RouteCreator)
export class RouteCreator {
    public createFrom(from: LineStop, to: LineStop, traversalState: DijkstraGraphTraverser): Route[] {
        return this.findRoutes(from, to, traversalState).map(route => {
            return new Route(traversalState.routeToLineStop.get(from).timeTaken, ...route.reverse());
        });
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