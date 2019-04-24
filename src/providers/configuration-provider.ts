import {Config} from './line-timings-config';
import {provide} from 'inversify-binding-decorators';
import {LineTimingsConfiguration} from '../models/config/line-timings-configuration';

@provide(ConfigurationProvider)
export class ConfigurationProvider {
    private static readonly AssetsPath = `src/assets/`;

    public async providePathForStationsMapFile(): Promise<string> {
        const stationsMapFileName = `stations-map.json`;
        return ConfigurationProvider.AssetsPath + stationsMapFileName;
    }

    public provideLineTimingsConfiguration(): LineTimingsConfiguration {
        return LineTimingsConfiguration.from(Config);
    }
}