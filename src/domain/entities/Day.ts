export class Day {
    private readonly dayId: number;
    private readonly date: string;

    private constructor(dayId: number, date: string) {
        this.dayId = dayId;
        this.date = date;
    }

    public static fromPersistence(data: {
        dayId: number;
        date: string;
    }): Day {
        return new Day(data.dayId, data.date);
    }

    public static create(date: string): Day {
        return new Day(0, date);
    }

    getDayId(): number {
        return this.dayId;
    }

    getDate(): string {
        return this.date;
    }

    toString(): string {
        return `
            dayId=${this.dayId},
            date=${this.date}
        `;
    }
}
