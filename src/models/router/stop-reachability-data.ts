import {LineStop} from '../line-stop';

export class StopReachabilityData extends Map<LineStop, { timeTaken: number; previousStop: LineStop }> {
    public setTimeTakenForNeighbour(stop: LineStop, viaStop: LineStop, timeTakenFromViaStop: number) {
        const timeTakenFromSource = this.get(viaStop).timeTaken + timeTakenFromViaStop;
        if (!this.has(stop)) {
            this.set(stop, {timeTaken: timeTakenFromSource, previousStop: viaStop});
        } else {
            if (timeTakenFromSource < this.get(stop).timeTaken) {
                this.set(stop, {timeTaken: timeTakenFromSource, previousStop: viaStop});
            }
        }
    }
}