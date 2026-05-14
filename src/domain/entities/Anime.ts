export class Anime {
    private readonly animeId: number;
    private readonly malId: number;
    private readonly broadcastId: number;
    private name: string;
    private synopsis: string;
    private imgMedium: string;
    private imgLarge: string;
    private startDate: Date;
    private endDate: Date;
    private readonly malMean: number;
    private readonly malRank: number;
    private mean: number;
    private rank: number;
    private numEpisodes: number;
    private status: AnimeStatus;
    private nextUpdate: Date;
    private likes: number;
    private genres: string[];
    private studios: string[];
    private broadcast?: { dayOfWeek: string; startTime: string };

    private constructor(
        animeId: number,
        malId: number,
        broadcastId: number,
        name: string,
        synopsis: string,
        imgMedium: string,
        imgLarge: string,
        startDate: Date,
        endDate: Date,
        malMean: number,
        malRank: number,
        mean: number,
        rank: number,
        numEpisodes: number,
        status: AnimeStatus,
        nextUpdate: Date,
        likes: number,
        genres: string[],
        studios: string[],
        broadcast?: { dayOfWeek: string; startTime: string }
    ) {
        this.animeId = animeId;
        this.malId = malId;
        this.broadcastId = broadcastId;
        this.name = name;
        this.synopsis = synopsis;
        this.imgMedium = imgMedium;
        this.imgLarge = imgLarge;
        this.startDate = startDate;
        this.endDate = endDate;
        this.malMean = malMean;
        this.malRank = malRank;
        this.mean = mean;
        this.rank = rank;
        this.numEpisodes = numEpisodes;
        this.status = status;
        this.nextUpdate = nextUpdate;
        this.likes = likes;
        this.genres = genres;
        this.studios = studios;
        this.broadcast = broadcast;
    }

    public static fromPersistence(data: {
        animeId: number;
        malId: number;
        broadcastId: number;
        name: string;
        synopsis: string;
        imgMedium: string;
        imgLarge: string;
        startDate: Date;
        endDate: Date;
        malMean: number;
        malRank: number;
        mean: number;
        rank: number;
        numEpisodes: number;
        status: AnimeStatus;
        nextUpdate: Date;
        likes: number;
        genres: string[];
        studios: string[];
        broadcast?: { dayOfWeek: string; startTime: string };
    }): Anime {
        return new Anime(
            data.animeId,
            data.malId,
            data.broadcastId,
            data.name,
            data.synopsis,
            data.imgMedium,
            data.imgLarge,
            data.startDate,
            data.endDate,
            data.malMean,
            data.malRank,
            data.mean,
            data.rank,
            data.numEpisodes,
            data.status,
            data.nextUpdate,
            data.likes,
            data.genres,
            data.studios,
            data.broadcast
        );
    }

    getAnimeId(): number {
        return this.animeId;
    }

    getMalId(): number {
        return this.malId;
    }

    getBroadcastId(): number {
        return this.broadcastId;
    }

    getName(): string {
        return this.name;
    }

    getImgMedium(): string {
        return this.imgMedium;
    }

    getImgLarge(): string {
        return this.imgLarge;
    }

    getMalMean(): number {
        return this.malMean;
    }

    getMalRank(): number {
        return this.malRank;
    }

    getMean(): number {
        return this.mean;
    }

    getRank(): number {
        return this.rank;
    }

    getSynopsis(): string {
        return this.synopsis;
    }

    getStartDate(): Date {
        return this.startDate;
    }

    getEndDate(): Date {
        return this.endDate;
    }

    getNumEpisodes(): number {
        return this.numEpisodes;
    }

    getStatus(): AnimeStatus {
        return this.status;
    }

    getNextUpdate(): Date {
        return this.nextUpdate;
    }

    getLikes(): number {
        return this.likes;
    }

    getGenres(): string[] {
        return this.genres;
    }

    getStudios(): string[] {
        return this.studios;
    }

    getBroadcast():
        | { dayOfWeek: string; startTime: string }
        | undefined {
        return this.broadcast;
    }

    isStale(): boolean {
        return this.nextUpdate < new Date();
    }

    toJSON() {
        return {
            malId: this.malId,
            name: this.name,
            synopsis: this.synopsis,
            imgMedium: this.imgMedium,
            imgLarge: this.imgLarge,
            startDate: this.startDate,
            endDate: this.endDate,
            malMean: this.malMean,
            malRank: this.malRank,
            mean: this.mean,
            rank: this.rank,
            numEpisodes: this.numEpisodes,
            status: this.status,
            nextUpdate: this.nextUpdate,
            likes: this.likes,
            genres: this.genres,
            studios: this.studios,
            broadcast: this.broadcast
                ? {
                      dayOfWeek: this.broadcast.dayOfWeek,
                      startTime: this.broadcast.startTime
                  }
                : undefined
        };
    }

    toString(): string {
        return `
            animeId=${this.animeId},
            malId=${this.malId},
            broadcastId=${this.broadcastId},
            name=${this.name},
            synopsis=${this.synopsis},
            imgMedium=${this.imgMedium},
            imgLarge=${this.imgLarge},
            startDate=${this.startDate},
            endDate=${this.endDate},
            malMean=${this.malMean},
            malRank=${this.malRank},
            mean=${this.mean},
            rank=${this.rank},
            numEpisodes=${this.numEpisodes},
            status=${this.status},
            nextUpdate=${this.nextUpdate},
            likes=${this.likes},
            genres=${this.genres},
            studios=${this.studios}
        `;
    }
}

export enum AnimeStatus {
    WATCHING = 'watching',
    COMPLETED = 'completed',
    ONHOLD = 'on_hold',
    DROPPED = 'dropped',
    PLANTOWATCH = 'plan_to_watch'
}
