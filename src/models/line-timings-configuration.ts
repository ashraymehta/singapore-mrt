import {first} from 'lodash';
import {TimeUtil} from '../utils/time-util';

class HoursConfig extends Array<{ start: string; days: string[]; end: string }> {
    public isApplicableFor(time: Date): boolean {
        return !!this.filter(night => night.days.includes(TimeUtil.getDay(time)))
            .find(peak => TimeUtil.isBetween(peak.start, peak.end, time))
    }
}

export class LineTimingsConfiguration {
    private peakHours: HoursConfig;
    private nightHours: HoursConfig;
    private readonly lines: {
        codes: string[];
        otherHours: { timeTakenForLineChange: number; timeTakenPerStation: number };
        peakHours: { timeTakenForLineChange: number; timeTakenPerStation: number };
        nightHours: { timeTakenForLineChange: number; timeTakenPerStation: number } | { isOperational: boolean }
    }[];

    public static from(config: object): LineTimingsConfiguration {
        const configuration = Object.assign(new LineTimingsConfiguration(), config);
        configuration.peakHours = new HoursConfig(...(<LineTimingsConfiguration>config).peakHours);
        configuration.nightHours = new HoursConfig(...(<LineTimingsConfiguration>config).nightHours);
        return configuration;
    }

    public getLineConfiguration(lineCode: string, time: Date): { isOperational: boolean; timeTakenPerStop: number; } {
        const isPeakHourTime = this.peakHours.isApplicableFor(time);
        const isNightHourTime = this.nightHours.isApplicableFor(time);
        const lineConfig = this.lines.find(lineConfig => lineConfig.codes.includes(lineCode));
        if (isPeakHourTime) {
            return {isOperational: true, timeTakenPerStop: lineConfig.peakHours.timeTakenPerStation};
        } else if (isNightHourTime) {
            if (Object.keys(lineConfig.nightHours).includes('isOperational')) {
                return {isOperational: false, timeTakenPerStop: Infinity};
            }
        }
        return {isOperational: true, timeTakenPerStop: lineConfig.otherHours.timeTakenPerStation};
    }

    public getTimeTakenForLineChange(time: Date): number {
        const lineConfig = first(this.lines);
        if (this.peakHours.isApplicableFor(time)) {
            return lineConfig.peakHours.timeTakenForLineChange;
        } else if (this.nightHours.isApplicableFor(time)) {
            return (lineConfig.nightHours as any).timeTakenForLineChange;
        } else {
            return lineConfig.otherHours.timeTakenForLineChange;
        }
    }
}