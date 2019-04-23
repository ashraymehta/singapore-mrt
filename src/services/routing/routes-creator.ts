import {flatten, min} from 'lodash';
import {Route} from '../../models/route';
import {Routes} from '../../models/routes';
import {LineStop} from '../../models/line-stop';
import {provide} from 'inversify-binding-decorators';
import {DijkstraGraphTraverser} from './dijkstra-graph-traverser';

@provide(RoutesCreator)
export class RoutesCreator {
    public createFrom(from: LineStop[], to: LineStop[], traversalState: DijkstraGraphTraverser): Routes {
        const allRoutesFromStops = from.map(fromStop => {
            return this.findRoutes(fromStop, to, traversalState).map(route => {
                const timeTaken = traversalState.routeToLineStop.get(fromStop).timeTaken;
                return new Route(timeTaken, ...route.reverse());
            });
        });
        const minTimeTaken = min(from.map(stop => traversalState.routeToLineStop.get(stop).timeTaken));
        return new Routes(...flatten(allRoutesFromStops).filter(route => route.timeTaken === minTimeTaken));
    }

    private findRoutes(from: LineStop, to: LineStop[], traversalState: DijkstraGraphTraverser): LineStop[][] {
        let currentStop = from;
        const route: LineStop[] = [];
        const routes = [];
        while (!to.includes(currentStop)) {
            route.push(currentStop);
            const previous = traversalState.routeToLineStop.get(currentStop).previousStops;
            if (previous.size === 1) {
                currentStop = [...previous][0];
            } else {
                const routesFromPrevious = flatten([...previous].map(prev => this.findRoutes(prev, to, traversalState)))
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