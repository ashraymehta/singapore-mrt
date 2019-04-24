import {Moment} from 'moment';
import moment = require("moment-timezone");

export class TimeUtil {
    private static SingaporeTimezone = 'Asia/Singapore';

    public static getDay(time: Date) {
        return moment(time).tz(TimeUtil.SingaporeTimezone).format('ddd');
    }

    public static isBetween(start: string, end: string, time: Date): boolean {
        const startTime = moment.tz(start, 'H:m', TimeUtil.SingaporeTimezone);
        const endTime = moment.tz(end, 'H:m', TimeUtil.SingaporeTimezone);
        const timeInSGTimezone = moment(time).tz(TimeUtil.SingaporeTimezone);
        return TimeUtil.minutesOfDay(timeInSGTimezone) >= TimeUtil.minutesOfDay(startTime) &&
            TimeUtil.minutesOfDay(timeInSGTimezone) <= TimeUtil.minutesOfDay(endTime);
    }

    private static minutesOfDay(m: Moment): number {
        return m.minutes() + m.hours() * 60;
    }
}