import {minBy} from 'lodash';
import {LineStop} from '../line-stop';

export class GraphTraversalState {
    public readonly unvisitedStops: Set<LineStop>;
    public readonly routeToStop: Map<LineStop, { timeTaken: number; previousStop: LineStop }>;

    private constructor(unvisitedStops: LineStop[]) {
        this.unvisitedStops = new Set<LineStop>(unvisitedStops);
        this.routeToStop = new Map<LineStop, { timeTaken: number, previousStop: LineStop }>();
    }

    public static start(unvisitedStops: LineStop[], startingStop: LineStop): GraphTraversalState {
        const traversalState = new GraphTraversalState(unvisitedStops);
        traversalState.unvisitedStops.forEach(stop => traversalState.routeToStop.set(stop, {
            timeTaken: Number.MAX_VALUE,
            previousStop: undefined
        }));

        traversalState.routeToStop.set(startingStop, {timeTaken: 0, previousStop: undefined});
        traversalState.unvisitedStops.delete(startingStop);

        return traversalState;
    }

    public updateTimeTaken(stop: LineStop, viaStop: LineStop, timeTakenFromViaStop: number): void {
        const timeTakenFromSource = this.routeToStop.get(viaStop).timeTaken + timeTakenFromViaStop;
        if (!this.routeToStop.has(stop)) {
            this.routeToStop.set(stop, {timeTaken: timeTakenFromSource, previousStop: viaStop});
        } else if (timeTakenFromSource < this.routeToStop.get(stop).timeTaken) {
            this.routeToStop.set(stop, {timeTaken: timeTakenFromSource, previousStop: viaStop});
        }
    }

    public getNearestUnvisitedStop(): LineStop | undefined {
        const reachabilityDataForNextStop = minBy([...this.routeToStop.entries()], ([stop, datum]) => {
            return this.unvisitedStops.has(stop) ? datum.timeTaken : undefined;
        });
        return reachabilityDataForNextStop ? reachabilityDataForNextStop[0] : undefined;
    }

    public markStopAsVisited(stop: LineStop): void {
        this.unvisitedStops.delete(stop);
    }
}