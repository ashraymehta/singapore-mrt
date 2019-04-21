import {minBy} from 'lodash';
import {LineStop} from '../models/line-stop';

export class DijkstraGraphTraverser {
    public readonly unvisitedStops: Set<LineStop>;
    public readonly routeToLineStop: Map<LineStop, { timeTaken: number; previousStops: LineStop[] }>;
    private readonly sourceStop: LineStop;
    private currentStop: LineStop;

    public constructor(unvisitedStops: LineStop[], sourceStop: LineStop) {
        this.sourceStop = sourceStop;
        this.unvisitedStops = new Set<LineStop>(unvisitedStops);
        this.routeToLineStop = new Map<LineStop, { timeTaken: number, previousStops: LineStop[] }>();
    }

    public static traverseWith(allStops: LineStop[], sourceStop: LineStop): DijkstraGraphTraverser {
        const graphTraversor = new DijkstraGraphTraverser(allStops, sourceStop);
        graphTraversor.unvisitedStops.forEach(stop => graphTraversor.routeToLineStop.set(stop, {
            timeTaken: Number.POSITIVE_INFINITY,
            previousStops: []
        }));

        graphTraversor.routeToLineStop.set(sourceStop, {timeTaken: 0, previousStops: []});
        return graphTraversor;
    }

    public optionallySaveTimeToLineStop(stop: LineStop, via: LineStop, timeTakenFromViaStop: number): void {
        const timeTakenFromSource = this.routeToLineStop.get(via).timeTaken + timeTakenFromViaStop;
        const existingRouteForStop = this.routeToLineStop.get(stop);
        if (timeTakenFromSource < existingRouteForStop.timeTaken) {
            this.routeToLineStop.set(stop, {timeTaken: timeTakenFromSource, previousStops: [via]});
        } else if (timeTakenFromSource === existingRouteForStop.timeTaken) {
            existingRouteForStop.previousStops.push(via);
        }
    }

    public hasNext(): boolean {
        return !!this.getNextStop();
    }

    public moveToNext(): LineStop {
        this.currentStop = this.getNextStop();
        this.markStopAsVisited(this.currentStop);
        return this.currentStop;
    }

    public getCurrentStop(): LineStop {
        return this.currentStop;
    }

    private markStopAsVisited(stop: LineStop): void {
        this.unvisitedStops.delete(stop);
    }

    private getNextStop(): LineStop | undefined {
        const routeDataForNextStop = minBy([...this.routeToLineStop.entries()], ([stop, datum]) => {
            return this.unvisitedStops.has(stop) ? datum.timeTaken : undefined;
        });
        if (routeDataForNextStop) {
            const nextStop = routeDataForNextStop[0];
            return this.routeToLineStop.get(nextStop).timeTaken === Number.MAX_VALUE ? undefined : nextStop;
        } else {
            return undefined;
        }
    }
}