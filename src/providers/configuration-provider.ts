import {provide} from 'inversify-binding-decorators';

@provide(ConfigurationProvider)
export class ConfigurationProvider {
    private static readonly AssetsPath = `src/assets/`;

    public async providePathForStationsMapFile(): Promise<string> {
        const stationsMapFileName = `stations-map.json`;
        return ConfigurationProvider.AssetsPath + stationsMapFileName;
    }

    public provideLineTimingsConfiguration(): LineTimingsConfigration {
        return lineTimingsConfiguration;
    }
}

interface LineTimingsConfigration {
    timingsTypes: { start?: string; end?: string; type: string; applicableOn: string[] }[];
    lineTimingsForType: {
        [key: string]: {
            lineCodes?: string[];
            isOperational?: boolean;
            timeTakenPerStationInMinutes?: number;
            timeTakenPerLineChangeInMinutes?: number;
        }[]
    };
}

const lineTimingsConfiguration: LineTimingsConfigration = {
    timingsTypes: [
        {
            start: "06:00",
            end: "09:00",
            type: "Peak",
            applicableOn: ["Mon", "Tue", "Wed", "Thu", "Fri"]
        },
        {
            start: "18:00",
            end: "21:00",
            type: "Peak",
            applicableOn: ["Mon", "Tue", "Wed", "Thu", "Fri"]
        },
        {
            start: "22:00",
            end: "06:00",
            type: "Night",
            applicableOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        },
        {
            type: "Default",
            applicableOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        }
    ],
    lineTimingsForType: {
        Peak: [
            {
                lineCodes: ["NS", "NE"],
                timeTakenPerStationInMinutes: 12,
                timeTakenPerLineChangeInMinutes: 15
            },
            {
                timeTakenPerStationInMinutes: 10,
                timeTakenPerLineChangeInMinutes: 15
            }
        ],
        Night: [
            {
                lineCodes: ["DT", "DG", "CE"],
                isOperational: false
            },
            {
                lineCodes: ["TE"],
                timeTakenPerStationInMinutes: 8,
                timeTakenPerLineChangeInMinutes: 10
            },
            {
                timeTakenPerStationInMinutes: 10,
                timeTakenPerLineChangeInMinutes: 10
            }
        ],
        Default: [
            {
                lineCodes: ["DT", "TE"],
                timeTakenPerStationInMinutes: 8,
                timeTakenPerLineChangeInMinutes: 10
            },
            {
                timeTakenPerStationInMinutes: 10,
                timeTakenPerLineChangeInMinutes: 10
            }
        ]
    }
};