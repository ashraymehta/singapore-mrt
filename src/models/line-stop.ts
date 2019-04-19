export class LineStop {
    private readonly code: string;
    private readonly openingDate: Date;

    constructor(code: string, openingDate: Date) {
        this.code = code;
        this.openingDate = openingDate;
    }
}