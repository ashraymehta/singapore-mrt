export class Logger {
    private readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    public static for(name: string): Logger {
        return new Logger(name);
    }

    public log(message: string): void {
        console.log(`[${new Date().toISOString()}] - ${this.name} - ${message}`);
    }
}