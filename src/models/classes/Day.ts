export class Day {
    private readonly dayId: number;
    private name: string;

    constructor(dayId: number, name: string) {
        this.dayId = dayId;
        this.name = name;
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
