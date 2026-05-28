export class Challenge {
    private readonly challengeId: number;
    private readonly typeId: number;
    private readonly dayId: number;
    private readonly animeId: number;
    private readonly data: Record<string, any>;

    private constructor(
        challengeId: number,
        typeId: number,
        dayId: number,
        animeId: number,
        data: Record<string, any>
    ) {
        this.challengeId = challengeId;
        this.typeId = typeId;
        this.dayId = dayId;
        this.animeId = animeId;
        this.data = data;
    }

    public static fromPersistence(data: {
        challengeId: number;
        typeId: number;
        dayId: number;
        animeId: number;
        data: Record<string, any>;
    }): Challenge {
        return new Challenge(
            data.challengeId,
            data.typeId,
            data.dayId,
            data.animeId,
            data.data
        );
    }

    public static create(
        typeId: number,
        dayId: number,
        animeId: number,
        data: Record<string, any>
    ): Challenge {
        return new Challenge(0, typeId, dayId, animeId, data);
    }

    getChallengeId(): number {
        return this.challengeId;
    }

    getTypeId(): number {
        return this.typeId;
    }

    getDayId(): number {
        return this.dayId;
    }

    getAnimeId(): number {
        return this.animeId;
    }

    getData(): Record<string, any> {
        return this.data;
    }

    toString(): string {
        return `
            challengeId=${this.challengeId},
            typeId=${this.typeId},
            dayId=${this.dayId},
            animeId=${this.animeId},
            data=${JSON.stringify(this.data)}
        `;
    }
}
