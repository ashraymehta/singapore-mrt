export const Config = {
    timeSlots: {
        peak: [
            {
                start: '06:00',
                end: '08:59',
                days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
            }, {
                start: '18:00',
                end: '20:59',
                days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
            }
        ],
        night: [
            {
                start: '00:00',
                end: '05:59',
                days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            }, {
                start: '22:00',
                end: '23:59',
                days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            }
        ],
    },
    timeConsumed: {
        perStop: [
            {
                codes: ['NS', 'NE'],
                peak: 12,
                night: 10,
                other: 10,
            },
            {
                codes: ['CG', 'CE'],
                peak: 10,
                night: undefined,
                other: 10,
            },
            {
                codes: ['DT'],
                peak: 10,
                night: undefined,
                other: 8,
            },
            {
                codes: ['TE'],
                peak: 10,
                night: 8,
                other: 8,
            },
            {
                codes: ['EW', 'CC'],
                peak: 10,
                night: 10,
                other: 10,
            }
        ],
        perLineChange: {
            peak: 15,
            night: 10,
            other: 10
        }
    }
};