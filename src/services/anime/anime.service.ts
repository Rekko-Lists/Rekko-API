import { AnimeRepository } from '../../domain/repositories/Anime.repository';
import { MalAnimeData } from '../../domain/schemas/anime/mal.schemas';
import { MalService } from './mal.service';

export class AnimeService {
    private readonly localSearchLimit = 10;
    private readonly totalSearchLimit = 20;
    private readonly malCandidateLimit = 25;

    constructor(
        private readonly animeRepository: AnimeRepository,
        private readonly malService: MalService
    ) {}

    async searchAnimeCandidates(query: string) {
        const local = await this.searchLocalCandidates(query);
        const malCandidates =
            await this.searchMalCandidates(query);
        const external = await this.filterExternalCandidates(
            malCandidates,
            this.totalSearchLimit - local.length
        );

        return {
            local,
            external
        };
    }

    private searchLocalCandidates(query: string) {
        return this.animeRepository.searchByName(
            query,
            this.localSearchLimit
        );
    }

    private searchMalCandidates(query: string) {
        return this.malService.searchAnimes(
            query,
            this.malCandidateLimit
        );
    }

    private async filterExternalCandidates(
        malCandidates: Array<MalAnimeData>,
        limit: number
    ) {
        // MAL may return anime we already have outside the 10 local results.
        const existingMalIds =
            await this.findExistingMalCandidateIds(
                malCandidates
            );

        return malCandidates
            .filter((anime) => !existingMalIds.has(anime.id))
            .slice(0, Math.max(limit, 0));
    }

    private async findExistingMalCandidateIds(
        malCandidates: Array<MalAnimeData>
    ) {
        const malIds = malCandidates.map((anime) => anime.id);
        const existingMalIds =
            await this.animeRepository.findExistingMalIds(
                malIds
            );

        return new Set(existingMalIds);
    }
}
