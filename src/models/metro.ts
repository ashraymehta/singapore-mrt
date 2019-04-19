export class LineStop {
    private readonly code: string;
    private readonly openingDate: Date;

    constructor(code: string, openingDate: Date) {
        this.code = code;
        this.openingDate = openingDate;
    }
}

export class Line {
    private readonly stops: LineStop[];

    constructor(stops: LineStop[]) {
        this.stops = stops;
    }
}

export class Metro {
    private readonly lines: Line[];

    constructor(lines: Line[]) {
        this.lines = lines;
    }
}