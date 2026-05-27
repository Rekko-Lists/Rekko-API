import {
    AnimeRelation,
    AnimeRelationInput
} from '../../../../domain/entities/AnimeRelation';
import { AnimeRelationRepository } from '../../../../domain/repositories/anime/AnimeRelation.repository';
import { prisma } from '../../../database/prisma.client';
import { handlePrismaError } from '../../../errors/prisma.errors';

export class AnimeRelationPrismaRepository
    implements AnimeRelationRepository
{
    constructor(private readonly db = prisma) {}

    private relationPriority(record: {
        relationType: string;
        relationLabel: string;
    }): number {
        const type = record.relationType.toLowerCase();
        const label = record.relationLabel.toLowerCase();
        const value = `${type} ${label}`;

        if (value.includes('prequel')) return 0;
        if (value.includes('sequel')) return 1;
        if (value.includes('ova')) return 2;
        return 3;
    }

    async upsertMany(
        animeId: number,
        relations: AnimeRelationInput[],
        tx?: any
    ): Promise<void> {
        if (!relations || relations.length === 0) return;

        const client = tx ?? this.db;

        try {
            // Recolectar los relatedMalIds para resolver cuáles ya están ingestados
            const relatedMalIds = relations.map((r) => r.relatedMalId);

            const existingTargets = await client.anime.findMany({
                where: { malId: { in: relatedMalIds } },
                select: { animeId: true, malId: true }
            });

            const malIdToAnimeId = new Map<number, number>(
                existingTargets.map(
                    (a: { animeId: number; malId: number }) => [
                        a.malId,
                        a.animeId
                    ]
                )
            );

            for (const relation of relations) {
                const relatedAnimeId =
                    malIdToAnimeId.get(relation.relatedMalId) ??
                    null;

                await client.animeRelation.upsert({
                    where: {
                        animeId_relatedMalId: {
                            animeId,
                            relatedMalId: relation.relatedMalId
                        }
                    },
                    update: {
                        relatedAnimeId,
                        relationType: relation.relationType,
                        relationLabel: relation.relationLabel,
                        relatedTitle: relation.relatedTitle,
                        relatedImage: relation.relatedImage ?? null
                    },
                    create: {
                        animeId,
                        relatedMalId: relation.relatedMalId,
                        relatedAnimeId,
                        relationType: relation.relationType,
                        relationLabel: relation.relationLabel,
                        relatedTitle: relation.relatedTitle,
                        relatedImage: relation.relatedImage ?? null
                    }
                });
            }
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async deleteObsolete(
        animeId: number,
        keepMalIds: number[],
        tx?: any
    ): Promise<void> {
        const client = tx ?? this.db;
        try {
            await client.animeRelation.deleteMany({
                where: keepMalIds.length > 0
                    ? { animeId, relatedMalId: { notIn: keepMalIds } }
                    : { animeId }
            });
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findByAnimeId(
        animeId: number
    ): Promise<AnimeRelation[]> {
        try {
            const records = await this.db.animeRelation.findMany({
                where: { animeId },
                orderBy: { animeRelationId: 'asc' }
            });

            return records
                .sort((a: any, b: any) => {
                    const priorityDiff =
                        this.relationPriority(a) -
                        this.relationPriority(b);

                    if (priorityDiff !== 0) return priorityDiff;
                    return a.animeRelationId - b.animeRelationId;
                })
                .map((record: any) =>
                    AnimeRelation.fromPersistence({
                        animeRelationId: record.animeRelationId,
                        animeId: record.animeId,
                        relatedMalId: record.relatedMalId,
                        relatedAnimeId: record.relatedAnimeId,
                        relationType: record.relationType,
                        relationLabel: record.relationLabel,
                        relatedTitle: record.relatedTitle,
                        relatedImage: record.relatedImage,
                        createdAt: record.createdAt
                    })
                );
        } catch (error) {
            handlePrismaError(error);
        }
    }
}
