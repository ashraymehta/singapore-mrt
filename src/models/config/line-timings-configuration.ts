import {HoursConfig} from './hours-config';

export class LineTimingsConfiguration {
    private readonly timeSlots: { peak: HoursConfig; night: HoursConfig; };
    private readonly timings: {
        perLineChange: Map<'peak' | 'night' | 'other', number>,
        perStop: {
            codes: string[];
            peak: number;
            other: number;
            night: number | undefined;
        }[];
    };

    private constructor(peak: HoursConfig, night: HoursConfig, perLineChange: Map<"peak" | "night" | "other", number>, perStop: any) {
        this.timeSlots = {peak, night};
        this.timings = {perLineChange, perStop};
    }

    public static from(config: object): LineTimingsConfiguration {
        const castedConfig = <LineTimingsConfiguration>config;
        const peakHours = new HoursConfig(...castedConfig.timeSlots.peak);
        const nightHours = new HoursConfig(...castedConfig.timeSlots.night);
        const lineChange = new Map(Object.entries(castedConfig.timings.perLineChange)) as Map<'peak' | 'night' | 'other', number>;
        return new LineTimingsConfiguration(peakHours, nightHours, lineChange, castedConfig.timings.perStop);
    }

    public getLineConfiguration(lineCode: string, time: Date): { isOperational: boolean; timeTakenPerStop: number; } {
        const isPeakHourTime = this.timeSlots.peak.isApplicableFor(time);
        const isNightHourTime = this.timeSlots.night.isApplicableFor(time);
        const lineConfig = this.timings.perStop.find(lineConfig => lineConfig.codes.includes(lineCode));
        if (isPeakHourTime) {
            return {isOperational: true, timeTakenPerStop: lineConfig.peak};
        } else if (isNightHourTime) {
            if (lineConfig.night === undefined) {
                return {isOperational: false, timeTakenPerStop: Infinity};
            } else {
                return {isOperational: true, timeTakenPerStop: lineConfig.night};
            }
        }
        return {isOperational: true, timeTakenPerStop: lineConfig.other};
    }

    public getTimeTakenForLineChange(time: Date): number {
        if (this.timeSlots.peak.isApplicableFor(time)) {
            return this.timings.perLineChange.get('peak');
        } else if (this.timeSlots.night.isApplicableFor(time)) {
            return this.timings.perLineChange.get('night');
        } else {
            return this.timings.perLineChange.get('other');
        }
    }
}