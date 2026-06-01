import { AnimeRelation } from '../AnimeRelation';
import { AnimeRelationDTO } from '../dtos/AnimeRelationDTO';

export class AnimeRelationMapper {
    static toDTO(relation: AnimeRelation): AnimeRelationDTO {
        return new AnimeRelationDTO({
            relatedMalId: relation.getRelatedMalId(),
            relatedAnimeId: relation.getRelatedAnimeId(),
            relationType: relation.getRelationType(),
            relationLabel: relation.getRelationLabel(),
            relatedTitle: relation.getRelatedTitle(),
            relatedImage: relation.getRelatedImage()
        });
    }

    static toDTOs(relations: AnimeRelation[]): AnimeRelationDTO[] {
        return relations.map((r) => this.toDTO(r));
    }
}
