import { Anime } from '../../../../domain/entities/Anime';
import { AnimeRepository } from '../../../../domain/repositories/anime/Anime.repository';
import { FindOptions } from '../../../../domain/schemas/find.schemas';
import { FindRepository } from '../../../../domain/schemas/find.schemas';
import { prisma } from '../../../database/prisma.client';
import { handlePrismaError } from '../../../errors/prisma.errors';
import {
    buildFilterWhere,
    buildPrismaPageQueryArray
} from '../../../../utils/prisma/prismaHelper';
import { Broadcast } from '../../../../domain/entities/Broadcast';

const GENRE_INCLUDE = {
    animeGenres: { include: { genre: true } }
} as const;

export class AnimePrismaRepository implements AnimeRepository {
    constructor(private readonly db = prisma) {}

    // Extrae nombres de género desde la relación incluida
    private withGenres(record: any): any {
        return {
            ...record,
            genres:
                record.animeGenres?.map(
                    (ag: any) => ag.genre.name
                ) ?? []
        };
    }

    // Construye los nested writes de Prisma para géneros
    private genreConnectOrCreate(genres: string[]) {
        if (!genres || genres.length === 0) return undefined;
        return {
            create: genres.map((name) => ({
                genre: {
                    connectOrCreate: {
                        where: { name },
                        create: { name }
                    }
                }
            }))
        };
    }

    async create(entity: Anime, tx?: any): Promise<Anime | null> {
        const client = tx ?? this.db;
        try {
            const animeData = entity as any;
            const {
                broadcast,
                genres,
                relatedAnime: _relatedAnime,
                ...animeWithoutRelations
            } = animeData;

            const createdBroadcast =
                await this.createBroadcast(broadcast, client);

            const created = await client.anime.create({
                data: {
                    ...animeWithoutRelations,
                    broadcast: {
                        connect: {
                            broadcastId:
                                createdBroadcast.getBroadcastId()
                        }
                    },
                    animeGenres:
                        this.genreConnectOrCreate(genres)
                },
                include: {
                    broadcast: true,
                    ...GENRE_INCLUDE
                }
            });

            return Anime.fromPersistence(
                this.withGenres(created)
            );
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

    async createBroadcast(
        broadcast: {
            dayOfWeek: string;
            startTime: string;
        },
        tx?: any
    ): Promise<Broadcast> {
        const client = tx ?? this.db;
        try {
            const bro = await client.broadcast.create({
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
    ): Promise<number[]> {
        const createdMalIds: number[] = [];
        try {
            for (const animeData of animesData) {
                try {
                    const {
                        broadcast,
                        genres,
                        relatedAnime: _relatedAnime,
                        ...animeDataWithoutRelations
                    } = animeData;

                    const createdBroadcast =
                        await this.createBroadcast(broadcast);

                    await this.db.anime.create({
                        data: {
                            ...animeDataWithoutRelations,
                            broadcast: {
                                connect: {
                                    broadcastId:
                                        createdBroadcast.getBroadcastId()
                                }
                            },
                            animeGenres:
                                this.genreConnectOrCreate(genres)
                        }
                    });

                    createdMalIds.push(animeDataWithoutRelations.malId);
                } catch (error: any) {
                    // Skip any unique-constraint violation — the anime
                    // already exists (by malId, name, or another unique field).
                    if (error?.code === 'P2002') {
                        continue;
                    }
                    throw error;
                }
            }
        } catch (error) {
            handlePrismaError(error);
        }
        return createdMalIds;
    }

    async updateAnime(
        malId: number,
        animeData: any,
        tx?: any
    ): Promise<Anime | null> {
        const client = tx ?? this.db;
        try {
            const {
                broadcast,
                genres,
                relatedAnime: _relatedAnime,
                likes: _likes,
                mean: _mean,
                members: _members,
                ...anime
            } = animeData;

            const updated = await client.anime.update({
                where: { malId },
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
                        : undefined,
                    // Al actualizar, borramos las relaciones existentes y recreamos
                    animeGenres: genres
                        ? {
                              deleteMany: {},
                              ...this.genreConnectOrCreate(
                                  genres
                              )
                          }
                        : undefined
                },
                include: {
                    broadcast: true,
                    ...GENRE_INCLUDE
                }
            });

            return Anime.fromPersistence(
                this.withGenres(updated)
            );
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
                    broadcast: true,
                    ...GENRE_INCLUDE
                },
                take: limit,
                orderBy: { malRank: 'asc' }
            });

            return animes.map((anime: any) =>
                Anime.fromPersistence(this.withGenres(anime))
            );
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async find(
        findOptions: FindOptions
    ): Promise<FindRepository<Anime>> {
        try {
            const { filters } = findOptions;

            // Extraer el filtro de géneros antes de buildFilterWhere
            // porque necesita una query de relación, no un operador escalar
            const { genres: genreFilter, ...otherFilters } =
                (filters || {}) as Record<string, any>;

            const where: any =
                Object.keys(otherFilters).length > 0
                    ? buildFilterWhere(otherFilters)
                    : {};

            if (genreFilter?.eq) {
                const genreNames = String(genreFilter.eq)
                    .split(',')
                    .map((g: string) => g.trim())
                    .filter(Boolean);
                where.animeGenres = {
                    some: { genre: { name: { in: genreNames } } }
                };
            }

            const { skip, take, orderBy } =
                buildPrismaPageQueryArray(
                    findOptions,
                    'animeId'
                );

            const [animes, total] = await Promise.all([
                this.db.anime.findMany({
                    where,
                    skip,
                    take,
                    orderBy,
                    include: GENRE_INCLUDE
                }),
                this.db.anime.count({ where })
            ]);

            const formattedAnimes = animes.map((anime: any) =>
                Anime.fromPersistence(this.withGenres(anime))
            );

            return { data: formattedAnimes as any, total };
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findByMalId(malId: number): Promise<Anime | null> {
        try {
            const anime = await this.db.anime.findUnique({
                where: { malId },
                include: {
                    broadcast: true,
                    ...GENRE_INCLUDE
                }
            });

            return anime
                ? Anime.fromPersistence(this.withGenres(anime))
                : null;
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
                where: { malId: { in: malIds } },
                select: { malId: true }
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
                    broadcast: true,
                    ...GENRE_INCLUDE
                }
            });

            return animes.map((anime: any) =>
                Anime.fromPersistence(this.withGenres(anime))
            );
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findTopSeasonal(
        year: number,
        season: string,
        limit: number
    ): Promise<Anime[]> {
        try {
            const monthRanges: Record<string, number[]> = {
                winter: [1, 2, 3],
                spring: [4, 5, 6],
                summer: [7, 8, 9],
                fall: [10, 11, 12]
            };
            const months = monthRanges[season.toLowerCase()];

            const animes = await this.db.anime.findMany({
                where: {
                    startDate: {
                        gte: new Date(Date.UTC(year, months[0] - 1, 1)),
                        lt: new Date(Date.UTC(year, months[2], 1))
                    }
                },
                orderBy: [{ malMean: 'desc' }, { malRank: 'asc' }],
                take: limit,
                include: {
                    broadcast: true,
                    ...GENRE_INCLUDE
                }
            });

            return animes.map((anime: any) =>
                Anime.fromPersistence(this.withGenres(anime))
            );
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findPopularWeekly(
        limit: number,
        status?: string
    ): Promise<Anime[]> {
        try {
            const weekStart = new Date();
            weekStart.setUTCHours(0, 0, 0, 0);
            const day = weekStart.getUTCDay();
            weekStart.setUTCDate(
                weekStart.getUTCDate() + (day === 0 ? -6 : 1 - day)
            );

            const records = await this.db.animeWeeklyActivity.findMany({
                where: {
                    weekStart,
                    ...(status && { anime: { status } })
                },
                orderBy: [{ score: 'desc' }, { animeId: 'asc' }],
                take: limit,
                include: {
                    anime: {
                        include: {
                            broadcast: true,
                            ...GENRE_INCLUDE
                        }
                    }
                }
            });

            return records.map((record: any) =>
                Anime.fromPersistence(
                    this.withGenres(record.anime)
                )
            );
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findAiringTodayJst(
        dayOfWeek: string,
        limit: number
    ): Promise<Anime[]> {
        try {
            const animes = await this.db.anime.findMany({
                where: {
                    status: 'currently_airing',
                    broadcast: {
                        dayOfWeek: {
                            equals: dayOfWeek,
                            mode: 'insensitive'
                        }
                    }
                },
                orderBy: [{ broadcast: { startTime: 'asc' } }, { malRank: 'asc' }],
                take: limit,
                include: {
                    broadcast: true,
                    ...GENRE_INCLUDE
                }
            });

            return animes.map((anime: any) =>
                Anime.fromPersistence(this.withGenres(anime))
            );
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findTopByStatus(
        status: string,
        limit: number
    ): Promise<Anime[]> {
        try {
            const animes = await this.db.anime.findMany({
                where: { status },
                orderBy: [
                    { malMean: 'desc' },
                    { malRank: 'asc' },
                    { members: 'desc' }
                ],
                take: limit,
                include: {
                    broadcast: true,
                    ...GENRE_INCLUDE
                }
            });

            return animes.map((anime: any) =>
                Anime.fromPersistence(this.withGenres(anime))
            );
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findAllGenres(): Promise<string[]> {
        try {
            const genres = await this.db.genre.findMany({
                orderBy: { name: 'asc' }
            });
            return genres.map((g: { name: string }) => g.name);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async bumpNextUpdate(
        malId: number,
        deltaMs: number
    ): Promise<void> {
        try {
            await this.db.anime.update({
                where: { malId },
                data: { nextUpdate: new Date(Date.now() + deltaMs) }
            });
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async updateMean(animeId: number, mean: number): Promise<Anime | null> {
        try {
            const updated = await this.db.anime.update({
                where: { animeId },
                data: { mean },
                include: {
                    broadcast: true,
                    animeGenres: { include: { genre: true } }
                }
            });
            return Anime.fromPersistence(this.withGenres(updated));
        } catch (error) {
            handlePrismaError(error);
        }
    }
}
