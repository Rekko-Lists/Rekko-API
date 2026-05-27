import { AnimeRelation, AnimeRelationInput } from '../../entities/AnimeRelation';

export interface AnimeRelationRepository {
    upsertMany(
        animeId: number,
        relations: AnimeRelationInput[],
        tx?: any
    ): Promise<void>;

    deleteObsolete(
        animeId: number,
        keepMalIds: number[],
        tx?: any
    ): Promise<void>;

    findByAnimeId(animeId: number): Promise<AnimeRelation[]>;
}
