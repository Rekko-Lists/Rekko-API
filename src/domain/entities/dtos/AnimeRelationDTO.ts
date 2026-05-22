export class AnimeRelationDTO {
    relatedMalId: number;
    relatedAnimeId: number | null;
    relationType: string;
    relationLabel: string;
    relatedTitle: string;
    relatedImage: string | null;

    constructor(data: {
        relatedMalId: number;
        relatedAnimeId: number | null;
        relationType: string;
        relationLabel: string;
        relatedTitle: string;
        relatedImage: string | null;
    }) {
        this.relatedMalId = data.relatedMalId;
        this.relatedAnimeId = data.relatedAnimeId;
        this.relationType = data.relationType;
        this.relationLabel = data.relationLabel;
        this.relatedTitle = data.relatedTitle;
        this.relatedImage = data.relatedImage;
    }
}
