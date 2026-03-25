export class Day {
    private readonly dayId: number;
    private name: string;

    private constructor(dayId: number, name: string) {
        this.dayId = dayId;
        this.name = name;
    }

    public static fromPersistence(data: {
        dayId: number;
        name: string;
    }): Day {
        return new Day(
            data.dayId,
            data.name
        );
    }

    getDayId(): number {
        return this.dayId;
    }

    getName(): string {
        return this.name;
    }

    toString(): string {
        return `
            dayId=${this.dayId},
            name=${this.name}
        `;
    }
}
