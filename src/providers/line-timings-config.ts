export const Config = {
    peakHours: [
        {
            start: "06:00",
            end: "08:59",
            days: ["Mon", "Tue", "Wed", "Thu", "Fri"]
        }, {
            start: "18:00",
            end: "20:59",
            days: ["Mon", "Tue", "Wed", "Thu", "Fri"]
        }
    ],
    nightHours: [
        {
            start: "00:00",
            end: "05:59",
            days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        }, {
            start: "22:00",
            end: "23:59",
            days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        }
    ],
    lines: [
        {
            codes: ["NS", "NE"],
            peakHours: {
                timeTakenPerStation: 12
            },
            nightHours: {
                timeTakenPerStation: 10
            },
            otherHours: {
                timeTakenPerStation: 10
            }
        },
        {
            codes: ["CG", "CE"],
            peakHours: {
                timeTakenPerStation: 10
            },
            nightHours: {
                isOperational: false
            },
            otherHours: {
                timeTakenPerStation: 10
            }
        },
        {
            codes: ["DT"],
            peakHours: {
                timeTakenPerStation: 10
            },
            nightHours: {
                isOperational: false
            },
            otherHours: {
                timeTakenPerStation: 8
            }
        },
        {
            codes: ["TE"],
            peakHours: {
                timeTakenPerStation: 10
            },
            nightHours: {
                timeTakenPerStation: 8
            },
            otherHours: {
                timeTakenPerStation: 8
            }
        },
        {
            codes: ["EW", "CC"],
            peakHours: {
                timeTakenPerStation: 10
            },
            nightHours: {
                timeTakenPerStation: 10
            },
            otherHours: {
                timeTakenPerStation: 10
            }
        }
    ],
    lineChange: {
        peak: 15,
        night: 10,
        other: 10
    }
};