export type AnimeUserState = {
    hasLiked?: boolean;
    rate?: number;
    watchState?: string;
    watchedEpisodes?: number;
};

export class AnimeDTO {
    animeId?: number;
    malId: number;
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
    likes: number;
    members: number;
    genres: string[];
    studios: string[];
    duration: number | null;
    premieredSeason: string | null;
    premieredYear: number | null;
    rating: string | null;
    demographic: string | null;
    broadcast?: {
        dayOfWeek: string;
        startTime: string;
    };
    userState?: AnimeUserState;

    constructor(data: {
        animeId?: number;
        malId: number;
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
        likes: number;
        members: number;
        genres: string[];
        studios: string[];
        duration: number | null;
        premieredSeason: string | null;
        premieredYear: number | null;
        rating: string | null;
        demographic: string | null;
        broadcast?: {
            dayOfWeek: string;
            startTime: string;
        };
        userState?: AnimeUserState;
    }) {
        this.animeId = data.animeId;
        this.malId = data.malId;
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
        this.likes = data.likes;
        this.members = data.members;
        this.genres = data.genres;
        this.studios = data.studios;
        this.duration = data.duration;
        this.premieredSeason = data.premieredSeason;
        this.premieredYear = data.premieredYear;
        this.rating = data.rating;
        this.demographic = data.demographic;
        this.broadcast = data.broadcast;
        if (
            data.userState &&
            Object.keys(data.userState).length > 0
        ) {
            this.userState = data.userState;
        }
    }
}
