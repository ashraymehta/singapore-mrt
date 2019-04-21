import {minBy} from 'lodash';
import {LineStop} from '../line-stop';

export class GraphTraversalState {
    public readonly unvisitedStops: Set<LineStop>;
    public readonly routeToStop: Map<LineStop, { timeTaken: number; previousStops: LineStop[] }>;

    private constructor(unvisitedStops: LineStop[]) {
        this.unvisitedStops = new Set<LineStop>(unvisitedStops);
        this.routeToStop = new Map<LineStop, { timeTaken: number, previousStops: LineStop[] }>();
    }

    public static start(unvisitedStops: LineStop[], startingStop: LineStop): GraphTraversalState {
        const traversalState = new GraphTraversalState(unvisitedStops);
        traversalState.unvisitedStops.forEach(stop => traversalState.routeToStop.set(stop, {
            timeTaken: Number.MAX_VALUE,
            previousStops: []
        }));

        traversalState.routeToStop.set(startingStop, {timeTaken: 0, previousStops: []});
        traversalState.unvisitedStops.delete(startingStop);

        return traversalState;
    }

    public updateTimeTaken(stop: LineStop, viaStop: LineStop, timeTakenFromViaStop: number): void {
        const timeTakenFromSource = this.routeToStop.get(viaStop).timeTaken + timeTakenFromViaStop;
        if (!this.routeToStop.has(stop)) {
            this.routeToStop.set(stop, {timeTaken: timeTakenFromSource, previousStops: [viaStop]});
        } else {
            const routeForStop = this.routeToStop.get(stop);
            if (timeTakenFromSource < routeForStop.timeTaken) {
                this.routeToStop.set(stop, {timeTaken: timeTakenFromSource, previousStops: [viaStop]});
            } else if (timeTakenFromSource === routeForStop.timeTaken) {
                routeForStop.previousStops.push(viaStop);
            }
        }
    }

    public getNextStop(): LineStop | undefined {
        const reachabilityDataForNextStop = minBy([...this.routeToStop.entries()], ([stop, datum]) => {
            return this.unvisitedStops.has(stop) ? datum.timeTaken : undefined;
        });
        if (reachabilityDataForNextStop) {
            const nextStop = reachabilityDataForNextStop[0];
            return this.routeToStop.get(nextStop).timeTaken === Number.MAX_VALUE ? undefined : nextStop;
        } else {
            return undefined;
        }
    }

    public markStopAsVisited(stop: LineStop): void {
        this.unvisitedStops.delete(stop);
    }
}