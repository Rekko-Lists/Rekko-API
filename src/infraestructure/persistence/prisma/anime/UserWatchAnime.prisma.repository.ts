import { UserWatchAnime } from '../../../../domain/entities/UserWatchAnime';
import { UserWatchAnimeRepository } from '../../../../domain/repositories/anime/UserWatchAnime.repository';
import {
    FindOptions,
    FindRepository
} from '../../../../domain/schemas/find.schemas';
import { UserWatchListItem } from '../../../../domain/schemas/anime/watch.schemas';
import { buildPrismaPageQueryArray } from '../../../../utils/prisma/prismaHelper';
import { prisma } from '../../../database/prisma.client';
import { handlePrismaError } from '../../../errors/prisma.errors';

export class UserWatchAnimePrismaRepository implements UserWatchAnimeRepository {
    constructor(private readonly db = prisma) {}

    private toWatchListItem(record: any): UserWatchListItem {
        return {
            userWatchAnimeId: record.userWatchAnimeId,
            userId: record.userId,
            animeId: record.animeId,
            numEpisodes: record.numEpisodes,
            state: String(record.state).toLowerCase(),
            anime: {
                malId: record.anime.malId,
                name: record.anime.name,
                imgMedium: record.anime.imgMedium,
                imgLarge: record.anime.imgLarge,
                malMean: record.anime.malMean,
                malRank: record.anime.malRank,
                mean: record.anime.mean,
                numEpisodes: record.anime.numEpisodes,
                status: record.anime.status,
                mediaType: record.anime.mediaType,
                likes: record.anime.likes,
                broadcast: {
                    dayOfWeek: record.anime.broadcast.dayOfWeek,
                    startTime: record.anime.broadcast.startTime
                }
            }
        };
    }

    async create(
        entity: UserWatchAnime
    ): Promise<UserWatchAnime | null> {
        try {
            const record = await this.db.userWatchAnime.create({
                data: {
                    userId: entity.getUserId(),
                    animeId: entity.getAnimeId(),
                    numEpisodes: entity.getNumEpisodes(),
                    state: entity.getState()
                }
            });
            return UserWatchAnime.fromPersistence(record);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            return await this.db.$transaction(
                async (tx: typeof this.db) => {
                    const existing =
                        await tx.userWatchAnime.findUnique({
                            where: { userWatchAnimeId: id },
                            select: { animeId: true }
                        });
                    if (!existing) return false;
                    await tx.userWatchAnime.delete({
                        where: { userWatchAnimeId: id }
                    });
                    await tx.anime.update({
                        where: { animeId: existing.animeId },
                        data: { members: { decrement: 1 } }
                    });
                    return true;
                }
            );
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findByUserAndAnime(
        userId: number,
        animeId: number
    ): Promise<UserWatchAnime | null> {
        try {
            const record =
                await this.db.userWatchAnime.findFirst({
                    where: { userId, animeId }
                });
            return record
                ? UserWatchAnime.fromPersistence(record)
                : null;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findByUserId(
        userId: number,
        findOptions: FindOptions
    ): Promise<FindRepository<UserWatchListItem>> {
        try {
            const { skip, take, orderBy } =
                buildPrismaPageQueryArray(
                    findOptions,
                    'userWatchAnimeId'
                );

            const [records, total] = await Promise.all([
                this.db.userWatchAnime.findMany({
                    where: { userId },
                    skip,
                    take,
                    orderBy,
                    include: {
                        anime: {
                            include: {
                                broadcast: true,
                                animeGenres: {
                                    include: { genre: true }
                                }
                            }
                        }
                    }
                }),
                this.db.userWatchAnime.count({
                    where: { userId }
                })
            ]);

            return {
                data: records.map((record: any) =>
                    this.toWatchListItem(record)
                ),
                total
            };
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findWatchByUserAndAnimeIds(
        animeIds: number[],
        userId: number
    ): Promise<Map<number, { state: string; numEpisodes: number }>> {
        if (animeIds.length === 0) return new Map();
        try {
            const records = await this.db.userWatchAnime.findMany({
                where: { userId, animeId: { in: animeIds } },
                select: {
                    animeId: true,
                    state: true,
                    numEpisodes: true
                }
            });
            return new Map(
                records.map((r: any) => [
                    r.animeId,
                    {
                        state: String(r.state).toLowerCase(),
                        numEpisodes: r.numEpisodes
                    }
                ])
            );
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async updateProgress(
        userId: number,
        animeId: number,
        numEpisodes: number,
        state: string
    ): Promise<UserWatchAnime> {
        try {
            const existing = await this.findByUserAndAnime(
                userId,
                animeId
            );
            if (!existing) {
                const [record] = await this.db.$transaction([
                    this.db.userWatchAnime.create({
                        data: {
                            userId,
                            animeId,
                            numEpisodes,
                            state
                        }
                    }),
                    this.db.anime.update({
                        where: { animeId },
                        data: { members: { increment: 1 } }
                    })
                ]);
                return UserWatchAnime.fromPersistence(record);
            }

            const record = await this.db.userWatchAnime.update({
                where: {
                    userWatchAnimeId:
                        existing.getUserWatchAnimeId()
                },
                data: {
                    numEpisodes,
                    state
                }
            });
            return UserWatchAnime.fromPersistence(record);
        } catch (error) {
            handlePrismaError(error);
        }
    }
}
