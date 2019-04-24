import {HoursConfig} from './hours-config';

export class LineTimingsConfiguration {
    private peakHours: HoursConfig;
    private nightHours: HoursConfig;
    private lineChange: Map<'peak' | 'night' | 'other', number>;
    private readonly lines: {
        codes: string[];
        otherHours: { timeTakenPerStation: number };
        peakHours: { timeTakenPerStation: number };
        nightHours: { timeTakenPerStation: number } | { isOperational: boolean }
    }[];

    private constructor(peakHours: HoursConfig, nightHours: HoursConfig, lineChange: Map<"peak" | "night" | "other", number>, lines: any) {
        this.peakHours = peakHours;
        this.nightHours = nightHours;
        this.lineChange = lineChange;
        this.lines = lines;
    }

    public static from(config: object): LineTimingsConfiguration {
        const peakHours = new HoursConfig(...(<LineTimingsConfiguration>config).peakHours);
        const nightHours = new HoursConfig(...(<LineTimingsConfiguration>config).nightHours);
        const lineChange = new Map(Object.entries((<LineTimingsConfiguration>config).lineChange)) as Map<'peak' | 'night' | 'other', number>;
        return new LineTimingsConfiguration(peakHours, nightHours, lineChange, (<any>config).lines);
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
        if (this.peakHours.isApplicableFor(time)) {
            return this.lineChange.get('peak');
        } else if (this.nightHours.isApplicableFor(time)) {
            return this.lineChange.get('night');
        } else {
            return this.lineChange.get('other');
        }
    }
}