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

    constructor(
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
        studios: string[]
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
