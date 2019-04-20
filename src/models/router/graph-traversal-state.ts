import {minBy} from 'lodash';
import {LineStop} from '../line-stop';

export class GraphTraversalState extends Map<LineStop, { timeTaken: number; previousStop: LineStop }> {
    public readonly unvisitedStops: Set<LineStop>;

    constructor(unvisitedStops: LineStop[]) {
        super();
        this.unvisitedStops = new Set<LineStop>(unvisitedStops);
    }

    public initializeUnvisitedStops(): void {
        this.unvisitedStops.forEach(stop => this.set(stop, {timeTaken: Number.MAX_VALUE, previousStop: undefined}));
    }

    public setTimeTakenForNeighbour(stop: LineStop, viaStop: LineStop, timeTakenFromViaStop: number): void {
        const timeTakenFromSource = this.get(viaStop).timeTaken + timeTakenFromViaStop;
        if (!this.has(stop)) {
            this.set(stop, {timeTaken: timeTakenFromSource, previousStop: viaStop});
        } else if (timeTakenFromSource < this.get(stop).timeTaken) {
            this.set(stop, {timeTaken: timeTakenFromSource, previousStop: viaStop});
        }
    }

    public getNearestUnvisitedStop(): LineStop | undefined {
        const reachabilityDataForNextStop = minBy([...this.entries()], ([stop, datum]) => {
            return this.unvisitedStops.has(stop) ? datum.timeTaken : undefined;
        });
        return reachabilityDataForNextStop ? reachabilityDataForNextStop[0] : undefined;
    }
}