import {TimeUtil} from '../../utils/time-util';

export class HoursConfig extends Array<{ start: string; days: string[]; end: string }> {
    public isApplicableFor(time: Date): boolean {
        return !!this.filter(night => night.days.includes(TimeUtil.getDay(time)))
            .find(peak => TimeUtil.isBetween(peak.start, peak.end, time))
    }
}