import moment = require('moment-timezone');
import {Moment} from 'moment-timezone/moment-timezone';

export class LineTimingsConfiguration {
    private readonly peakHours: { start: string; days: string[]; end: string }[];
    private readonly nightHours: { start: string; days: string[]; end: string }[];
    private readonly lines: {
        codes: string[];
        otherHours: { timeTakenForLineChange: number; timeTakenPerStation: number };
        peakHours: { timeTakenForLineChange: number; timeTakenPerStation: number };
        nightHours: { timeTakenForLineChange: number; timeTakenPerStation: number } | { isOperational: boolean }
    }[];

    public static from(config: object): LineTimingsConfiguration {
        return Object.assign(new LineTimingsConfiguration(), config);
    }

    public getLineConfiguration(lineCode: string, time: Date): { isOperational: boolean; timeTakenPerStationInMinutes: number; timeTakenPerLineChangeInMinutes: number } {
        const isPeakHourTime = !!this.peakHours.filter(peak => peak.days.includes(moment(time).format('ddd')))
            .find(peak => this.isBetween(peak.start, peak.end, time));
        const isNightHourTime = !!this.nightHours.filter(night => night.days.includes(moment(time).format('ddd')))
            .find(peak => this.isBetween(peak.start, peak.end, time));
        const lineConfig = this.lines.find(lineConfig => lineConfig.codes.includes(lineCode));
        if (isPeakHourTime) {
            return {
                isOperational: true,
                timeTakenPerStationInMinutes: lineConfig.peakHours.timeTakenPerStation,
                timeTakenPerLineChangeInMinutes: lineConfig.peakHours.timeTakenForLineChange,
            }
        } else if (isNightHourTime) {
            if (Object.keys(lineConfig.nightHours).includes('isOperational')) {
                return {
                    isOperational: false,
                    timeTakenPerStationInMinutes: Infinity,
                    timeTakenPerLineChangeInMinutes: Infinity
                };
            }
        }
        return {
            isOperational: true,
            timeTakenPerStationInMinutes: lineConfig.otherHours.timeTakenPerStation,
            timeTakenPerLineChangeInMinutes: lineConfig.otherHours.timeTakenForLineChange,
        };
    }

    private isBetween(start: string, end: string, time: Date): boolean {
        const startTime = moment.tz(start, 'H:m', 'Asia/Singapore');
        const endTime = moment.tz(end, 'H:m', 'Asia/Singapore');
        const timeInSGTimezone = moment(time).tz('Asia/Singapore');
        return this.minutesOfDay(timeInSGTimezone) >= this.minutesOfDay(startTime) &&
            this.minutesOfDay(timeInSGTimezone) <= this.minutesOfDay(endTime);
    }

    private minutesOfDay(m: Moment): number {
        return m.minutes() + m.hours() * 60;
    }
}