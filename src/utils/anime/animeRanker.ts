import { Anime } from '../../domain/entities/Anime';
import { rankByRelevance } from '../search/search';

export class AnimeRanker {
    rankByQuery(animes: Anime[], query: string): Anime[] {
        return rankByRelevance(
            animes,
            query,
            (anime) => anime.getName(),
            (anime) => anime.getMalId()
        );
    }

    rankGeneric(animes: Anime[]): Anime[] {
        return rankByRelevance(
            animes,
            'anime',
            (anime) => anime.getName(),
            (anime) => anime.getMalId()
        );
    }
}
