import { Anime } from '../../../domain/entities/Anime';
import { AnimeRepository } from '../../../domain/repositories/Anime.repository';
import { FindOptions } from '../../../domain/schemas/find.schemas';
import { FindRepository } from '../../../domain/schemas/find.schemas';
import { prisma } from '../../database/prisma.client';
import { handlePrismaError } from '../../errors/prisma.errors';

export class AnimePrismaRepository implements AnimeRepository {
    constructor(private readonly db = prisma) {}

    create(entity: Anime): Promise<Anime | null> {
        throw new Error('Method not implemented.');
    }

    findById(
        id: number,
        fields?: string[]
    ): Promise<Anime | null> {
        throw new Error('Method not implemented.');
    }

    find(findOptions: FindOptions): Promise<FindRepository<Anime>> {
        throw new Error('Method not implemented.');
    }

    update(where: unknown, entity: unknown): Promise<Anime | null> {
        throw new Error('Method not implemented.');
    }

    delete(where: unknown): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    findByMalId(malId: number): Promise<Anime | null> {
        throw new Error('Method not implemented.');
    }

    async searchByName(
        query: string,
        limit: number
    ): Promise<Anime[]> {
        try {
            const animes = await this.db.anime.findMany({
                where: {
                    name: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                take: limit,
                orderBy: {
                    malRank: 'asc'
                }
            });

            return animes.map((anime: any) =>
                Anime.fromPersistence(anime)
            );
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findExistingMalIds(
        malIds: number[]
    ): Promise<number[]> {
        if (malIds.length === 0) return [];

        try {
            const animes = await this.db.anime.findMany({
                where: {
                    malId: {
                        in: malIds
                    }
                },
                select: {
                    malId: true
                }
            });

            return animes.map((anime: { malId: number }) => anime.malId);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    findTopRanked(limit: number): Promise<Anime[]> {
        throw new Error('Method not implemented.');
    }

    findByStatus(
        status: string,
        limit: number
    ): Promise<Anime[]> {
        throw new Error('Method not implemented.');
    }

    updateByMalId(malId: number): Promise<Anime | null> {
        throw new Error('Method not implemented.');
    }

    updateStats(
        animeId: number,
        mean: number,
        rank: number,
        likes: number
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
