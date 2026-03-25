export class Challenge {
    private readonly challengeId: number;
    private readonly typeId: number;
    private readonly dayId: number;
    private readonly animeId: number;
    private data: JSON;

    private constructor(
        challengeId: number,
        typeId: number,
        dayId: number,
        animeId: number,
        data: JSON
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
        data: JSON;
    }): Challenge {
        return new Challenge(
            data.challengeId,
            data.typeId,
            data.dayId,
            data.animeId,
            data.data
        );
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

    toString(): string {
        return `
            challengeId=${this.challengeId},
            typeId=${this.typeId},
            dayId=${this.dayId},
            animeId=${this.animeId},
            data=${this.data}
        `;
    }
}
