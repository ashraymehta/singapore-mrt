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
                timeTakenPerStation: 12,
                timeTakenForLineChange: 15
            },
            nightHours: {
                timeTakenPerStation: 10,
                timeTakenForLineChange: 10
            },
            otherHours: {
                timeTakenPerStation: 10,
                timeTakenForLineChange: 10
            }
        },
        {
            codes: ["CG", "CE"],
            peakHours: {
                timeTakenPerStation: 10,
                timeTakenForLineChange: 15
            },
            nightHours: {
                isOperational: false
            },
            otherHours: {
                timeTakenPerStation: 10,
                timeTakenForLineChange: 10
            }
        },
        {
            codes: ["DT"],
            peakHours: {
                timeTakenPerStation: 10,
                timeTakenForLineChange: 15
            },
            nightHours: {
                isOperational: false
            },
            otherHours: {
                timeTakenPerStation: 8,
                timeTakenForLineChange: 10
            }
        },
        {
            codes: ["TE"],
            peakHours: {
                timeTakenPerStation: 10,
                timeTakenForLineChange: 15
            },
            nightHours: {
                timeTakenPerStation: 8,
                timeTakenForLineChange: 10
            },
            otherHours: {
                timeTakenPerStation: 8,
                timeTakenForLineChange: 10
            }
        },
        {
            codes: ["EW", "CC"],
            peakHours: {
                timeTakenPerStation: 10,
                timeTakenForLineChange: 15
            },
            nightHours: {
                timeTakenPerStation: 10,
                timeTakenForLineChange: 10
            },
            otherHours: {
                timeTakenPerStation: 10,
                timeTakenForLineChange: 10
            }
        }
    ]
};