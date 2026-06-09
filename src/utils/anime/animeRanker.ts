import { Anime } from '../../domain/entities/Anime';
import { rankByRelevance } from '../search/search';

export class AnimeRanker {
    rankByQuery(
        animes: Anime[],
        query: string,
        aliasesByMalId: Map<number, string[]> = new Map()
    ): Anime[] {
        return rankByRelevance(
            animes,
            query,
            (anime) => [
                anime.getName(),
                ...(aliasesByMalId.get(anime.getMalId()) ?? [])
            ],
            (anime) => anime.getMalId(),
            (anime) => anime.getMalRank()
        );
    }

    rankGeneric(animes: Anime[]): Anime[] {
        return rankByRelevance(
            animes,
            'anime',
            (anime) => anime.getName(),
            (anime) => anime.getMalId(),
            (anime) => anime.getMalRank()
        );
    }
}
