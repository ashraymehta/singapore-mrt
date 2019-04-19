export class ConfigurationProvider {
    private static readonly AssetsPath = `src/assets/`;

    public async providePathForStationsMapFile(): Promise<string> {
        const stationsMapFileName = `stations-map.json`;
        return ConfigurationProvider.AssetsPath + stationsMapFileName;
    }
}