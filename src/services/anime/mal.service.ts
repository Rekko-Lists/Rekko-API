import { MalService as MalApiService } from '../../infraestructure/services/mal/mal.service';
import { NotFoundError } from '../../domain/errors/http.errors';
import {
    MalAnimeData,
    MalAnime,
    malSearchParamsSchema,
    malSearchSchema,
    malAnimeDataSchema
} from '../../domain/schemas/anime/mal.schemas';

export class MalService {
    private readonly animeFields =
        'id,title,synopsis,main_picture,start_date,end_date,mean,rank,num_episodes,status,studios,genres';

    constructor(private readonly malApiService: MalApiService) {}

    async searchAnimes(
        query: string,
        limit: number = 10
    ): Promise<Array<MalAnimeData>> {
        const validatedParams = malSearchParamsSchema.parse({
            query,
            limit: Math.min(limit, 25)
        });

        const response = await this.malApiService.fetchFromMal(
            '/anime',
            {
                q: validatedParams.query,
                limit: validatedParams.limit ?? 10,
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
                : null,
            malMean: malData.mean || 0,
            malRank: malData.rank || 0,
            numEpisodes: malData.num_episodes || 0,
            status: malData.status || 'Unknown',
            genres: malData.genres?.map((g) => g.name) || [],
            studios: malData.studios?.map((s) => s.name) || []
        };
    }
}
