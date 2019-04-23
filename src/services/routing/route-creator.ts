import {flatten, min} from 'lodash';
import {Route} from '../../models/route';
import {LineStop} from '../../models/line-stop';
import {provide} from 'inversify-binding-decorators';
import {DijkstraGraphTraverser} from './dijkstra-graph-traverser';

@provide(RouteCreator)
export class RouteCreator {
    public createFrom(from: LineStop[], to: LineStop[], traversalState: DijkstraGraphTraverser): Route[] {
        const allRoutesFromStops = from.map(fromStop => {
            return this.findRoutes(fromStop, to, traversalState).map(route => {
                const timeTaken = traversalState.routeToLineStop.get(fromStop).timeTaken;
                return new Route(timeTaken, ...route.reverse());
            });
        });
        const minTimeTaken = min(from.map(stop => traversalState.routeToLineStop.get(stop).timeTaken));
        return flatten(allRoutesFromStops).filter(route => route.timeTaken === minTimeTaken);
    }

    private findRoutes(from: LineStop, to: LineStop[], traversalState: DijkstraGraphTraverser): LineStop[][] {
        let currentStop = from;
        const route: LineStop[] = [];
        const routes = [];
        while (!to.includes(currentStop)) {
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
            route.push(currentStop);
        }
        routes.push(route);
        return routes;
    }
}