export class Type {
    private readonly typeId: number;
    private name: string;

    constructor(typeId: number, name: string) {
        this.typeId = typeId;
        this.name = name;
    }

    getId(): number {
        return this.typeId;
    }

    getName(): string {
        return this.name;
    }

    toString(): string {
        return `
            typeId=${this.typeId},
            name=${this.name}
        `;
    }
}
