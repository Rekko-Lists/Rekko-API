import { Anime } from '../../../../domain/entities/Anime';
import { AnimeRepository } from '../../../../domain/repositories/anime/Anime.repository';
import { FindOptions } from '../../../../domain/schemas/find.schemas';
import { FindRepository } from '../../../../domain/schemas/find.schemas';
import { prisma } from '../../../database/prisma.client';
import { handlePrismaError } from '../../../errors/prisma.errors';
import { buildFilterWhere } from '../../../../utils/prisma/prismaHelper';
import { Broadcast } from '../../../../domain/entities/Broadcast';
import { validSeasons } from '../../../../domain/schemas/anime/mal.schemas';

export class AnimePrismaRepository implements AnimeRepository {
    constructor(private readonly db = prisma) {}

    async create(entity: Anime): Promise<Anime | null> {
        try {
            const animeData = entity as any;
            const { broadcast, ...animeWithoutBroadcast } =
                animeData;

            const createdBroadcast =
                await this.createBroadcast(broadcast);

            const created = await this.db.anime.create({
                data: {
                    ...animeWithoutBroadcast,
                    broadcast: {
                        connect: {
                            broadcastId:
                                createdBroadcast.getBroadcastId()
                        }
                    }
                },
                include: {
                    broadcast: true
                }
            });

            return Anime.fromPersistence(created);
        } catch (error: any) {
            if (
                error?.code === 'P2002' &&
                error?.meta?.target?.includes('mal_id')
            ) {
                return null;
            }
            handlePrismaError(error);
        }
    }

    async createBroadcast(broadcast: {
        dayOfWeek: string;
        startTime: string;
    }): Promise<Broadcast> {
        try {
            const bro = await this.db.broadcast.create({
                data: {
                    dayOfWeek: broadcast?.dayOfWeek || 'unknown',
                    startTime: broadcast?.startTime || '00:00'
                }
            });
            return Broadcast.fromPersistence(bro);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async createTransactionErrorHandling(
        animesData: Array<any>
    ): Promise<void> {
        try {
            for (const animeData of animesData) {
                try {
                    const {
                        broadcast,
                        ...animeDataWithoutBroadcast
                    } = animeData;

                    const createdBroadcast =
                        await this.createBroadcast(broadcast);

                    await this.db.anime.create({
                        data: {
                            ...animeDataWithoutBroadcast,
                            broadcast: {
                                connect: {
                                    broadcastId:
                                        createdBroadcast.getBroadcastId()
                                }
                            }
                        }
                    });
                } catch (error: any) {
                    // Si es error de constraint en mal_id, ignorar
                    if (
                        error?.code === 'P2002' &&
                        error?.meta?.target?.includes('mal_id')
                    ) {
                        continue;
                    } else {
                        throw error;
                    }
                }
            }
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async updateAnime(
        malId: number,
        animeData: any
    ): Promise<Anime | null> {
        try {
            const { broadcast, ...anime } = animeData;

            const updated = await this.db.anime.update({
                where: {
                    malId
                },
                data: {
                    ...anime,
                    broadcast: broadcast
                        ? {
                              update: {
                                  dayOfWeek:
                                      broadcast.dayOfWeek ||
                                      'Unknown',
                                  startTime:
                                      broadcast.startTime ||
                                      '00:00'
                              }
                          }
                        : undefined
                },
                include: {
                    broadcast: true
                }
            });

            return Anime.fromPersistence(updated);
        } catch (error) {
            handlePrismaError(error);
        }
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
                include: {
                    broadcast: true
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

    async find(
        findOptions: FindOptions
    ): Promise<FindRepository<Anime>> {
        try {
            const { select, pagination, sort, filters } =
                findOptions;

            // Build where clause from filters
            const where = filters
                ? buildFilterWhere(filters)
                : {};

            const skip =
                (pagination.page - 1) * pagination.limit;
            const take = pagination.limit;

            const orderBy = sort
                ? { [sort.field]: sort.order }
                : { animeId: 'asc' };

            const [animes, total] = await Promise.all([
                this.db.anime.findMany({
                    where,
                    skip,
                    take,
                    orderBy
                }),
                this.db.anime.count({ where })
            ]);

            const formattedAnimes = animes.map((anime: any) => {
                return Anime.fromPersistence(anime);
            });

            return {
                data: formattedAnimes as any,
                total
            };
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findByMalId(malId: number): Promise<Anime | null> {
        try {
            const anime = await this.db.anime.findUnique({
                where: {
                    malId
                },
                include: {
                    broadcast: true
                }
            });

            return anime ? Anime.fromPersistence(anime) : null;
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

            return animes.map(
                (anime: { malId: number }) => anime.malId
            );
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findBySeason(
        year: number,
        season: string
    ): Promise<Anime[]> {
        try {
            const monthRanges: Record<string, number[]> = {
                winter: [1, 2, 3],
                spring: [4, 5, 6],
                summer: [7, 8, 9],
                fall: [10, 11, 12]
            };

            const months = monthRanges[season.toLowerCase()];

            const where = {
                AND: [
                    {
                        startDate: {
                            gte: new Date(year, months[0] - 1, 1)
                        }
                    },
                    {
                        startDate: {
                            lt: new Date(year, months[2] + 1, 1)
                        }
                    }
                ]
            };

            const animes = await this.db.anime.findMany({
                where,
                orderBy: { malRank: 'asc' },
                include: {
                    broadcast: true
                }
            });

            return animes.map((anime: any) =>
                Anime.fromPersistence(anime)
            );
        } catch (error) {
            handlePrismaError(error);
        }
    }
}
