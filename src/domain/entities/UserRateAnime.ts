export class UserRateAnime {
    private readonly userRateAnimeId: number;
    private readonly userId: number;
    private readonly animeId: number;
    private rate: number;

    constructor(
        userRateAnimeId: number,
        userId: number,
        animeId: number,
        rate: number
    ) {
        this.userRateAnimeId = userRateAnimeId;
        this.userId = userId;
        this.animeId = animeId;
        this.rate = rate;
    }

    getUserRateAnimeId(): number {
        return this.userRateAnimeId;
    }

    getUserId(): number {
        return this.userId;
    }

    getAnimeId(): number {
        return this.animeId;
    }

    getRate(): number {
        return this.rate;
    }

    toString(): string {
        return `
            userRateAnimeId=${this.userRateAnimeId},
            userId=${this.userId},
            animeId=${this.animeId},
            rate=${this.rate}
        `;
    }
}
