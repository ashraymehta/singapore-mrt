import {LineStop} from '../line-stop';

export class StopReachabilityData extends Map<LineStop, { timeTaken: number; previousStop: LineStop }> {
}