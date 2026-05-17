import { MalService as MalApiService } from '../../infraestructure/services/mal/mal.service';
import { NotFoundError } from '../../exceptions/exceptions';
import { SEARCH_LIMITS } from '../../domain/schemas/search/search.schemas';
import {
    MalAnimeData,
    MalAnime,
    malSearchParamsSchema,
    malSearchSchema,
    malAnimeDataSchema,
    validSeasons
} from '../../domain/schemas/anime/mal.schemas';

export class MalService {
    private readonly animeFields =
        'id,title,synopsis,main_picture,start_date,end_date,mean,rank,num_episodes,status,studios,genres,broadcast,media_type';

    constructor(private readonly malApiService: MalApiService) {}

    async searchAnimes(
        query: string,
        limit: number = SEARCH_LIMITS.MAL_SEARCH_LIMIT
    ): Promise<Array<MalAnimeData>> {
        const validatedParams = malSearchParamsSchema.parse({
            query,
            limit: Math.min(
                limit,
                SEARCH_LIMITS.MAL_SEARCH_LIMIT
            )
        });

        const response = await this.malApiService.fetchFromMal(
            '/anime',
            {
                q: validatedParams.query,
                limit:
                    validatedParams.limit ??
                    SEARCH_LIMITS.MAL_SEARCH_LIMIT,
                fields: this.animeFields
            }
        );

        const data = await response.json();
        const validated = malSearchSchema.parse(data);

        return validated.data.map((item) => item.node);
    }

    async getTrendingAnimes(
        limit: number = SEARCH_LIMITS.MAL_TRENDING_LIMIT,
        offset: number = 0
    ): Promise<Array<MalAnimeData>> {
        const response = await this.malApiService.fetchFromMal(
            '/anime/ranking',
            {
                ranking_type: 'all',
                limit: Math.min(
                    limit,
                    SEARCH_LIMITS.MAL_TRENDING_LIMIT
                ),
                offset,
                fields: this.animeFields
            }
        );

        const data = await response.json();
        const validated = malSearchSchema.parse(data);

        return validated.data.map((item) => item.node);
    }

    async getAnimeById(malId: number): Promise<MalAnime> {
        let response: Response;

        try {
            response = await this.malApiService.fetchFromMal(
                `/anime/${malId}`,
                {
                    fields: this.animeFields
                }
            );
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw new NotFoundError(
                    `Anime with MAL ID ${malId} was not found`
                );
            }

            throw error;
        }

        const data = await response.json();
        return malAnimeDataSchema.parse(data);
    }

    async getSeasonalAnimes(
        year: number,
        season: string,
        limit: number = SEARCH_LIMITS.MAL_SEARCH_LIMIT
    ): Promise<Array<MalAnimeData>> {
        const normalizedSeason = season.toLowerCase();

        if (!validSeasons.includes(normalizedSeason)) {
            throw new Error(
                `Invalid season. Must be one of: ${validSeasons.join(', ')}`
            );
        }

        const response = await this.malApiService.fetchFromMal(
            `/anime/season/${year}/${normalizedSeason}`,
            {
                limit: Math.min(
                    limit,
                    SEARCH_LIMITS.MAL_SEARCH_LIMIT
                ),
                fields: this.animeFields
            }
        );

        const data = await response.json();
        const validated = malSearchSchema.parse(data);

        return validated.data.map((item) => item.node);
    }

    mapMalToAnime(malData: MalAnimeData) {
        return {
            malId: malData.id,
            name: malData.title,
            synopsis: malData.synopsis || '',
            imgMedium: malData.main_picture?.medium || '',
            imgLarge: malData.main_picture?.large || '',
            startDate: malData.start_date
                ? new Date(malData.start_date)
                : new Date(),
            endDate: malData.end_date
                ? new Date(malData.end_date)
                : new Date(),
            malMean: malData.mean || 0,
            malRank: malData.rank || 0,
            mean: 0,
            rank: 0,
            numEpisodes: malData.num_episodes || 0,
            status: malData.status || 'Unknown',
            genres: malData.genres?.map((g) => g.name) || [],
            studios: malData.studios?.map((s) => s.name) || [],
            mediaType: malData.media_type || 'tv',
            likes: 0,
            nextUpdate: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            ),
            broadcast: {
                dayOfWeek:
                    malData.broadcast?.day_of_the_week ||
                    'Unknown',
                startTime:
                    malData.broadcast?.start_time || '00:00'
            }
        };
    }
}
