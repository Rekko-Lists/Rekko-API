import { Anime } from '../../domain/entities/Anime';
import { User } from '../../domain/entities/User';
import { Post } from '../../domain/entities/Post';
import { AnimeRepository } from '../../domain/repositories/anime/Anime.repository';
import { UserRepository } from '../../domain/repositories/user/User.repository';
import { PostRepository } from '../../domain/repositories/publication/Post.repository';
import { MalAnimeData } from '../../domain/schemas/anime/mal.schemas';
import { PaginatedResponseWithMalStatus } from '../../domain/schemas/find.schemas';
import {
    SEARCH_LIMITS,
    SearchOptions
} from '../../domain/schemas/search/search.schemas';
import { MalService } from '../anime/mal.service';
import { rankByRelevance } from '../../utils/search/search';
import { AnimeDuplicator } from './animeDuplicator.service';
import { AnimeRanker } from '../../utils/anime/animeRanker';
import { Paginator } from '../../utils/pagination/paginator';

export class SearchService {
    private readonly deduplicator: AnimeDuplicator;
    private readonly ranker: AnimeRanker;
    private readonly paginator: Paginator;

    constructor(
        private readonly animeRepository: AnimeRepository,
        private readonly userRepository: UserRepository<User>,
        private readonly postRepository: PostRepository,
        private readonly malService: MalService
    ) {
        this.deduplicator = new AnimeDuplicator(malService);
        this.ranker = new AnimeRanker();
        this.paginator = new Paginator();
    }

    async search(
        options: SearchOptions
    ): Promise<PaginatedResponseWithMalStatus<Anime>> {
        const { query, pagination } = options;
        const page = pagination?.page || 1;
        const limit =
            pagination?.limit ||
            SEARCH_LIMITS.DEFAULT_PAGE_LIMIT;

        if (query && typeof query === 'string' && query.trim()) {
            return this.searchAnimesWithMalPaginated(
                query,
                page,
                limit
            );
        } else {
            return this.getAnimesTrendingPaginated(page, limit);
        }
    }

    async searchAnimesWithMalPaginated(
        query: string,
        page: number = 1,
        limit: number = SEARCH_LIMITS.DEFAULT_PAGE_LIMIT
    ): Promise<PaginatedResponseWithMalStatus<Anime>> {
        return this.searchAndMerge(
            this.animeRepository.searchByName(
                query,
                SEARCH_LIMITS.DB_LOCAL_LIMIT
            ),
            this.malService.searchAnimes(
                query,
                SEARCH_LIMITS.MAL_SEARCH_LIMIT
            ),
            query,
            page,
            limit
        );
    }

    async getAnimesTrendingPaginated(
        page: number = 1,
        limit: number = SEARCH_LIMITS.DEFAULT_PAGE_LIMIT
    ): Promise<PaginatedResponseWithMalStatus<Anime>> {
        return this.searchAndMerge(
            this.animeRepository.searchByName(
                '',
                SEARCH_LIMITS.DB_LOCAL_LIMIT
            ),
            this.malService.getTrendingAnimes(
                SEARCH_LIMITS.MAL_TRENDING_LIMIT
            ),
            undefined,
            page,
            limit
        );
    }

    private async searchAndMerge(
        dbPromise: Promise<Anime[]>,
        malPromise: Promise<any[]>,
        query: string | undefined,
        page: number,
        limit: number
    ): Promise<PaginatedResponseWithMalStatus<Anime>> {
        const [dbResult, malResult] = await Promise.allSettled([
            dbPromise,
            malPromise
        ]);

        const dbAnimes =
            dbResult.status === 'fulfilled'
                ? dbResult.value
                : [];

        const malApiWorked = malResult.status === 'fulfilled';
        const malAnimes = malApiWorked ? malResult.value : [];

        if (!malApiWorked && malResult.reason) {
            console.error(
                'MAL API error (falling back to DB only):',
                malResult.reason
            );
        }

        let merged: Anime[];
        if (malApiWorked && malAnimes.length > 0) {
            merged = this.deduplicator.mergeResults(
                dbAnimes,
                malAnimes
            );

            const newMalAnimes =
                this.deduplicator.getNewMalAnimes(
                    dbAnimes,
                    malAnimes
                );
            if (newMalAnimes.length > 0) {
                this.insertNewMalAnimes(newMalAnimes).catch(
                    (error) => {
                        console.error(
                            'Error inserting MAL animes:',
                            error
                        );
                    }
                );
            }
        } else {
            merged = dbAnimes;
        }

        const ranked =
            merged.length > 0 && query
                ? this.ranker.rankByQuery(merged, query)
                : this.ranker.rankGeneric(merged);

        const paginated = this.paginator.paginate(
            ranked,
            page,
            limit
        );

        return {
            ...paginated,
            withMalData: malApiWorked
        };
    }

    private async insertNewMalAnimes(
        malAnimes: Array<MalAnimeData>
    ): Promise<void> {
        const animesData = malAnimes.map((malAnime) =>
            this.malService.mapMalToAnime(malAnime)
        );

        await this.animeRepository.createTransactionErrorHandling(
            animesData as any
        );
    }

    async searchUsers(query: string): Promise<User[]> {
        const users = await this.userRepository.searchByName(
            query,
            SEARCH_LIMITS.USER_SEARCH_LIMIT
        );

        const sorted = rankByRelevance(
            users,
            query,
            (user) => user.getUsername(),
            (user) => user.getUserId()
        );

        return sorted.slice(0, SEARCH_LIMITS.MAX_RESULTS);
    }

    async searchPosts(query: string): Promise<Post[]> {
        const posts = await this.postRepository.searchByTitle(
            query,
            SEARCH_LIMITS.MAX_RESULTS
        );

        return posts;
    }
}
