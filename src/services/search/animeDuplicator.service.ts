import { Anime } from '../../domain/entities/Anime';
import { MalAnimeData } from '../../domain/schemas/anime/mal.schemas';
import { MalService } from '../anime/mal.service';

export class AnimeDuplicator {
    constructor(private readonly malService: MalService) {}

    getNewMalAnimes(
        dbAnimes: Anime[],
        malAnimes: any[]
    ): MalAnimeData[] {
        const existingMalIds = new Set(
            dbAnimes.map((anime: Anime) => anime.getMalId())
        );

        return malAnimes.filter(
            (malAnime: any) => !existingMalIds.has(malAnime.id)
        );
    }

    convertMalAnimesToEntities(
        newMalAnimes: MalAnimeData[]
    ): Anime[] {
        return newMalAnimes.map((malAnime: any) => {
            const mapped =
                this.malService.mapMalToAnime(malAnime);
            return Anime.fromPersistence(mapped as any);
        });
    }

    mergeResults(dbAnimes: Anime[], malAnimes: any[]): Anime[] {
        const newMalAnimes = this.getNewMalAnimes(
            dbAnimes,
            malAnimes
        );
        const malAnimesAsAnime =
            this.convertMalAnimesToEntities(newMalAnimes);

        return [...dbAnimes, ...malAnimesAsAnime];
    }
}
