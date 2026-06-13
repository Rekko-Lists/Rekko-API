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
import { buildSearchText } from '../../utils/search/normalize';

export class MalService {
    private readonly animeFields =
        'id,title,alternative_titles,synopsis,main_picture,start_date,end_date,mean,rank,num_episodes,status,studios,genres,broadcast,media_type,average_episode_duration,start_season,rating,related_anime';

    /**
     * In-memory TTL cache for MAL trending results.
     *
     * `getTrendingAnimes` is called on every catalogue request (e.g. by
     * `AnimeService.getCatalogue`) just to discover new animes for background
     * sync. The MAL round-trip dominates the catalogue latency, so we cache
     * the result per (limit, offset) for 15 minutes — MAL's ranking moves
     * slowly and consistency here is not critical.
     */
    private trendingCache = new Map<
        string,
        { data: MalAnimeData[]; expiresAt: number }
    >();
    private readonly TRENDING_CACHE_TTL_MS = 15 * 60 * 1000;

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
        const cacheKey = `${limit}:${offset}`;
        const cached = this.trendingCache.get(cacheKey);

        if (cached && cached.expiresAt > Date.now()) {
            return cached.data;
        }

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

        const result = validated.data.map((item) => item.node);

        this.trendingCache.set(cacheKey, {
            data: result,
            expiresAt: Date.now() + this.TRENDING_CACHE_TTL_MS
        });

        return result;
    }

    async getAnimeById(
        malId: number,
        timeoutMs?: number
    ): Promise<MalAnime> {
        let response: Response;

        try {
            response = await this.malApiService.fetchFromMal(
                `/anime/${malId}`,
                {
                    fields: this.animeFields
                },
                timeoutMs
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

    /**
     * MAL returns episode duration in seconds. We persist minutes,
     * rounded to the nearest integer. Null/undefined/zero stays null.
     */
    private mapDuration(
        averageEpisodeDuration: number | null | undefined
    ): number | null {
        if (
            averageEpisodeDuration === null ||
            averageEpisodeDuration === undefined ||
            averageEpisodeDuration <= 0
        ) {
            return null;
        }
        return Math.round(averageEpisodeDuration / 60);
    }

    /**
     * MAL `start_season.season` arrives lowercased
     * (winter|spring|summer|fall). Normalize to canonical
     * capitalized form so the frontend can render it directly.
     */
    private mapPremieredSeason(
        season: string | null | undefined
    ): string | null {
        if (!season) return null;
        const lower = season.trim().toLowerCase();
        if (lower.length === 0) return null;
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    }

    mapMalToAnime(malData: MalAnimeData) {
        const titleEnglish =
            malData.alternative_titles?.en || null;
        const titleSynonyms = [
            ...(malData.alternative_titles?.synonyms ?? []),
            malData.alternative_titles?.ja
        ].filter((t): t is string => Boolean(t));

        return {
            malId: malData.id,
            name: malData.title,
            titleEnglish,
            titleSynonyms,
            searchText: buildSearchText(
                malData.title,
                titleEnglish,
                titleSynonyms
            ),
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
            malRank: malData.rank ?? 999999,
            mean: 0,
            numEpisodes: malData.num_episodes || 0,
            status: malData.status || 'Unknown',
            genres: malData.genres?.map((g) => g.name) || [],
            studios: malData.studios?.map((s) => s.name) || [],
            mediaType: malData.media_type || 'tv',
            duration: this.mapDuration(
                malData.average_episode_duration
            ),
            premieredSeason: this.mapPremieredSeason(
                malData.start_season?.season
            ),
            premieredYear: malData.start_season?.year ?? null,
            rating: malData.rating ?? null,
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
            },
            relatedAnime: this.mapMalRelatedAnime(malData)
        };
    }

    mapMalRelatedAnime(malData: MalAnimeData): Array<{
        relatedMalId: number;
        relationType: string;
        relationLabel: string;
        relatedTitle: string;
        relatedImage: string | null;
    }> {
        if (
            !malData.related_anime ||
            malData.related_anime.length === 0
        ) {
            return [];
        }

        return malData.related_anime.map((entry) => ({
            relatedMalId: entry.node.id,
            relationType: entry.relation_type,
            relationLabel: entry.relation_type_formatted,
            relatedTitle: entry.node.title,
            relatedImage:
                entry.node.main_picture?.large ||
                entry.node.main_picture?.medium ||
                null
        }));
    }
}
