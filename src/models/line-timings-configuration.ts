import {first} from 'lodash';
import {Moment} from 'moment-timezone/moment-timezone';
import moment = require('moment-timezone');

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

    public getLineConfiguration(lineCode: string, time: Date): { isOperational: boolean; timeTakenPerStationInMinutes: number; } {
        const isPeakHourTime = this.isPeakHour(time);
        const isNightHourTime = this.isNightHour(time);
        const lineConfig = this.lines.find(lineConfig => lineConfig.codes.includes(lineCode));
        if (isPeakHourTime) {
            return {isOperational: true, timeTakenPerStationInMinutes: lineConfig.peakHours.timeTakenPerStation};
        } else if (isNightHourTime) {
            if (Object.keys(lineConfig.nightHours).includes('isOperational')) {
                return {isOperational: false, timeTakenPerStationInMinutes: Infinity};
            }
        }
        return {isOperational: true, timeTakenPerStationInMinutes: lineConfig.otherHours.timeTakenPerStation};
    }

    public getTimeTakenForLineChange(time: Date): number {
        const lineConfig = first(this.lines);
        if (this.isPeakHour(time)) {
            return lineConfig.peakHours.timeTakenForLineChange;
        } else if (this.isNightHour(time)) {
            return (lineConfig.nightHours as any).timeTakenForLineChange;
        } else {
            return lineConfig.otherHours.timeTakenForLineChange;
        }
    }

    private isNightHour(time: Date): boolean {
        return !!this.nightHours.filter(night => night.days.includes(moment(time).tz('Asia/Singapore').format('ddd')))
            .find(peak => this.isBetween(peak.start, peak.end, time));
    }

    private isPeakHour(time: Date): boolean {
        return !!this.peakHours.filter(peak => peak.days.includes(moment(time).tz('Asia/Singapore').format('ddd')))
            .find(peak => this.isBetween(peak.start, peak.end, time));
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