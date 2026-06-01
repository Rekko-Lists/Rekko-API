export interface AnimeRelationInput {
    relatedMalId: number;
    relationType: string;
    relationLabel: string;
    relatedTitle: string;
    relatedImage?: string | null;
}

export class AnimeRelation {
    private readonly animeRelationId: number;
    private readonly animeId: number;
    private readonly relatedMalId: number;
    private readonly relatedAnimeId: number | null;
    private readonly relationType: string;
    private readonly relationLabel: string;
    private readonly relatedTitle: string;
    private readonly relatedImage: string | null;
    private readonly createdAt: Date;

    private constructor(
        animeRelationId: number,
        animeId: number,
        relatedMalId: number,
        relatedAnimeId: number | null,
        relationType: string,
        relationLabel: string,
        relatedTitle: string,
        relatedImage: string | null,
        createdAt: Date
    ) {
        this.animeRelationId = animeRelationId;
        this.animeId = animeId;
        this.relatedMalId = relatedMalId;
        this.relatedAnimeId = relatedAnimeId;
        this.relationType = relationType;
        this.relationLabel = relationLabel;
        this.relatedTitle = relatedTitle;
        this.relatedImage = relatedImage;
        this.createdAt = createdAt;
    }

    public static fromPersistence(data: {
        animeRelationId: number;
        animeId: number;
        relatedMalId: number;
        relatedAnimeId: number | null;
        relationType: string;
        relationLabel: string;
        relatedTitle: string;
        relatedImage: string | null;
        createdAt: Date;
    }): AnimeRelation {
        return new AnimeRelation(
            data.animeRelationId,
            data.animeId,
            data.relatedMalId,
            data.relatedAnimeId,
            data.relationType,
            data.relationLabel,
            data.relatedTitle,
            data.relatedImage,
            data.createdAt
        );
    }

    public static fromInput(
        animeId: number,
        input: AnimeRelationInput
    ): AnimeRelation {
        return new AnimeRelation(
            0,
            animeId,
            input.relatedMalId,
            null,
            input.relationType,
            input.relationLabel,
            input.relatedTitle,
            input.relatedImage ?? null,
            new Date()
        );
    }

    getAnimeRelationId(): number {
        return this.animeRelationId;
    }

    getAnimeId(): number {
        return this.animeId;
    }

    getRelatedMalId(): number {
        return this.relatedMalId;
    }

    getRelatedAnimeId(): number | null {
        return this.relatedAnimeId;
    }

    getRelationType(): string {
        return this.relationType;
    }

    getRelationLabel(): string {
        return this.relationLabel;
    }

    getRelatedTitle(): string {
        return this.relatedTitle;
    }

    getRelatedImage(): string | null {
        return this.relatedImage;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    toJSON() {
        return {
            animeRelationId: this.animeRelationId,
            animeId: this.animeId,
            relatedMalId: this.relatedMalId,
            relatedAnimeId: this.relatedAnimeId,
            relationType: this.relationType,
            relationLabel: this.relationLabel,
            relatedTitle: this.relatedTitle,
            relatedImage: this.relatedImage,
            createdAt: this.createdAt
        };
    }
}
