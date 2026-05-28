import { AnimeConstructorData } from '../schemas/anime/anime.schemas';

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
    private numEpisodes: number;
    // MAL devuelve `finished_airing`, `currently_airing`, `not_yet_aired`, etc.
    // No es un set cerrado en código — guardamos el string tal cual.
    private status: string;
    private nextUpdate: Date;
    private likes: number;
    private members: number;
    private genres: string[];
    private studios: string[];
    private duration: number | null;
    private premieredSeason: string | null;
    private premieredYear: number | null;
    private rating: string | null;
    private broadcast?: { dayOfWeek: string; startTime: string };

    private constructor(data: AnimeConstructorData) {
        this.animeId = data.animeId;
        this.malId = data.malId;
        this.broadcastId = data.broadcastId;
        this.name = data.name;
        this.synopsis = data.synopsis;
        this.imgMedium = data.imgMedium;
        this.imgLarge = data.imgLarge;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.malMean = data.malMean;
        this.malRank = data.malRank;
        this.mean = data.mean;
        this.numEpisodes = data.numEpisodes;
        this.status = data.status;
        this.nextUpdate = data.nextUpdate;
        this.likes = data.likes;
        this.members = data.members;
        this.genres = data.genres;
        this.studios = data.studios;
        this.duration = data.duration;
        this.premieredSeason = data.premieredSeason;
        this.premieredYear = data.premieredYear;
        this.rating = data.rating;
        this.broadcast = data.broadcast;
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
        numEpisodes: number;
        status: string;
        nextUpdate: Date;
        likes: number;
        members: number;
        genres: string[];
        studios: string[];
        duration?: number | null;
        premieredSeason?: string | null;
        premieredYear?: number | null;
        rating?: string | null;
        broadcast?: { dayOfWeek: string; startTime: string };
    }): Anime {
        const constructorData: AnimeConstructorData = {
            animeId: data.animeId,
            malId: data.malId,
            broadcastId: data.broadcastId,
            name: data.name,
            synopsis: data.synopsis,
            imgMedium: data.imgMedium,
            imgLarge: data.imgLarge,
            startDate: data.startDate,
            endDate: data.endDate,
            malMean: data.malMean,
            malRank: data.malRank,
            mean: data.mean,
            numEpisodes: data.numEpisodes,
            status: data.status,
            nextUpdate: data.nextUpdate,
            likes: data.likes,
            members: data.members,
            genres: data.genres,
            studios: data.studios,
            duration: data.duration ?? null,
            premieredSeason: data.premieredSeason ?? null,
            premieredYear: data.premieredYear ?? null,
            rating: data.rating ?? null,
            broadcast: data.broadcast
        };

        return new Anime(constructorData);
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

    getStatus(): string {
        return this.status;
    }

    getNextUpdate(): Date {
        return this.nextUpdate;
    }

    getLikes(): number {
        return this.likes;
    }

    getMembers(): number {
        return this.members;
    }

    getGenres(): string[] {
        return this.genres;
    }

    getStudios(): string[] {
        return this.studios;
    }

    getDuration(): number | null {
        return this.duration;
    }

    getPremieredSeason(): string | null {
        return this.premieredSeason;
    }

    getPremieredYear(): number | null {
        return this.premieredYear;
    }

    getRating(): string | null {
        return this.rating;
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
            numEpisodes: this.numEpisodes,
            status: this.status,
            nextUpdate: this.nextUpdate,
            likes: this.likes,
            members: this.members,
            genres: this.genres,
            studios: this.studios,
            duration: this.duration,
            premieredSeason: this.premieredSeason,
            premieredYear: this.premieredYear,
            rating: this.rating,
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
            numEpisodes=${this.numEpisodes},
            status=${this.status},
            nextUpdate=${this.nextUpdate},
            likes=${this.likes},
            members=${this.members},
            genres=${this.genres},
            studios=${this.studios},
            duration=${this.duration},
            premieredSeason=${this.premieredSeason},
            premieredYear=${this.premieredYear},
            rating=${this.rating}
        `;
    }
}
