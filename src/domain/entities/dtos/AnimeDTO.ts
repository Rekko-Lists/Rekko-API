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
    rank: number;
    numEpisodes: number;
    status: string;
    likes: number;
    genres: string[];
    studios: string[];
    broadcast?: {
        dayOfWeek: string;
        startTime: string;
    };

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
        rank: number;
        numEpisodes: number;
        status: string;
        likes: number;
        genres: string[];
        studios: string[];
        broadcast?: {
            dayOfWeek: string;
            startTime: string;
        };
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
        this.rank = data.rank;
        this.numEpisodes = data.numEpisodes;
        this.status = data.status;
        this.likes = data.likes;
        this.genres = data.genres;
        this.studios = data.studios;
        this.broadcast = data.broadcast;
    }
}
