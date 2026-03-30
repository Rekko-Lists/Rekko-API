export class UserWatchAnime {
    private readonly userWatchAnimeId: number;
    private readonly userId: number;
    private readonly animeId: number;
    private numEpisodes: number;
    private state: string;

    private constructor(
        userWatchAnimeId: number,
        userId: number,
        animeId: number,
        numEpisodes: number,
        state: string
    ) {
        this.userWatchAnimeId = userWatchAnimeId;
        this.userId = userId;
        this.animeId = animeId;
        this.numEpisodes = numEpisodes;
        this.state = state;
    }

    public static fromPersistence(data: {
        userWatchAnimeId: number;
        userId: number;
        animeId: number;
        numEpisodes: number;
        state: string;
    }): UserWatchAnime {
        return new UserWatchAnime(
            data.userWatchAnimeId,
            data.userId,
            data.animeId,
            data.numEpisodes,
            data.state
        );
    }

    getUserWatchAnimeId(): number {
        return this.userWatchAnimeId;
    }

    getUserId(): number {
        return this.userId;
    }

    getAnimeId(): number {
        return this.animeId;
    }

    toString(): string {
        return `
            userWatchAnimeId=${this.userWatchAnimeId},
            userId=${this.userId},
            animeId=${this.animeId},
            numEpisodes=${this.numEpisodes},
            state=${this.state}
        `;
    }
}
