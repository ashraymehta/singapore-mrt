export class Logger {
    private static readonly IsDebugLoggingEnabled = false;
    private readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    public static for(name: string): Logger {
        return new Logger(name);
    }

    public debug(message: string): void {
        if (Logger.IsDebugLoggingEnabled) {
            console.debug(`[${new Date().toISOString()}] - ${this.name} - ${message}`);
        }
    }
}