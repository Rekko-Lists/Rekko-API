import { UserRateAnime } from '../../../../domain/entities/UserRateAnime';
import { UserRateAnimeRepository } from '../../../../domain/repositories/anime/UserRateAnime.repository';
import {
    FindOptions,
    FindRepository
} from '../../../../domain/schemas/find.schemas';
import { UserRateListItem } from '../../../../domain/schemas/anime/rate.schemas';
import { buildPrismaPageQueryArray } from '../../../../utils/prisma/prismaHelper';
import { prisma } from '../../../database/prisma.client';
import { handlePrismaError } from '../../../errors/prisma.errors';

export class UserRateAnimePrismaRepository implements UserRateAnimeRepository {
    constructor(private readonly db = prisma) {}

    private toRateListItem(record: any): UserRateListItem {
        return {
            userRateAnimeId: record.userRateAnimeId,
            userId: record.userId,
            animeId: record.animeId,
            rate: record.rate,
            anime: {
                malId: record.anime.malId,
                name: record.anime.name,
                imgMedium: record.anime.imgMedium,
                imgLarge: record.anime.imgLarge,
                malMean: record.anime.malMean,
                malRank: record.anime.malRank,
                mean: record.anime.mean,
                status: record.anime.status,
                mediaType: record.anime.mediaType,
                likes: record.anime.likes
            }
        };
    }

    async create(
        entity: UserRateAnime
    ): Promise<UserRateAnime | null> {
        try {
            const record = await this.db.userRateAnime.create({
                data: {
                    userId: entity.getUserId(),
                    animeId: entity.getAnimeId(),
                    rate: entity.getRate()
                }
            });
            return UserRateAnime.fromPersistence(record);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            await this.db.userRateAnime.delete({
                where: { userRateAnimeId: id }
            });
            return true;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findByUserAndAnime(
        userId: number,
        animeId: number
    ): Promise<UserRateAnime | null> {
        try {
            const record = await this.db.userRateAnime.findFirst(
                {
                    where: { userId, animeId }
                }
            );
            return record
                ? UserRateAnime.fromPersistence(record)
                : null;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findByUserId(
        userId: number,
        findOptions: FindOptions
    ): Promise<FindRepository<UserRateListItem>> {
        try {
            const { skip, take, orderBy } =
                buildPrismaPageQueryArray(
                    findOptions,
                    'userRateAnimeId'
                );

            const [records, total] = await Promise.all([
                this.db.userRateAnime.findMany({
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
                this.db.userRateAnime.count({
                    where: { userId }
                })
            ]);

            return {
                data: records.map((record: any) =>
                    this.toRateListItem(record)
                ),
                total
            };
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findRatesByUserAndAnimeIds(
        animeIds: number[],
        userId: number
    ): Promise<Map<number, number>> {
        if (animeIds.length === 0) return new Map();
        try {
            const records = await this.db.userRateAnime.findMany({
                where: { userId, animeId: { in: animeIds } },
                select: { animeId: true, rate: true }
            });
            return new Map(
                records.map((r: any) => [r.animeId, r.rate])
            );
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async updateRate(
        userRateAnimeId: number,
        rate: number
    ): Promise<UserRateAnime | null> {
        try {
            const record = await this.db.userRateAnime.update({
                where: { userRateAnimeId },
                data: { rate }
            });
            return UserRateAnime.fromPersistence(record);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async getAverageRateByAnime(
        animeId: number
    ): Promise<number | null> {
        try {
            const aggregate =
                await this.db.userRateAnime.aggregate({
                    where: { animeId },
                    _avg: {
                        rate: true
                    }
                });
            return aggregate._avg.rate;
        } catch (error) {
            handlePrismaError(error);
        }
    }
}
