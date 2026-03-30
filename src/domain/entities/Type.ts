export class Type {
    private readonly typeId: number;
    private name: string;

    private constructor(typeId: number, name: string) {
        this.typeId = typeId;
        this.name = name;
    }

    public static fromPersistence(data: {
        typeId: number;
        name: string;
    }): Type {
        return new Type(data.typeId, data.name);
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
