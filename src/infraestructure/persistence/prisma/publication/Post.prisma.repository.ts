import { Post } from '../../../../domain/entities/Post';
import { PostRepository } from '../../../../domain/repositories/publication/Post.repository';
import {
    FindOptions,
    FindRepository
} from '../../../../domain/schemas/find.schemas';
import { PostWhereUnique } from '../../../../domain/schemas/publication/post.schemas';
import { prisma } from '../../../database/prisma.client';
import { handlePrismaError } from '../../../errors/prisma.errors';
import { buildPrismaPageQueryArray } from '../../../../utils/prisma/prismaHelper';
import {
    ANIME_WEEKLY_POST_WEIGHT,
    getUtcWeekStart
} from '../../../../utils/date/week';

const POST_INCLUDE = {
    user: {
        select: {
            username: true,
            profileImage: true
        }
    },
    animes: {
        include: {
            anime: {
                select: {
                    malId: true,
                    name: true,
                    imgMedium: true,
                    imgLarge: true
                }
            }
        }
    },
    _count: {
        select: { comments: true }
    }
} as const;

export class PostPrismaRepository implements PostRepository {
    constructor(private readonly db = prisma) {}

    private buildWhere(
        findOptions: FindOptions
    ): Record<string, any> {
        const createdAt = findOptions.filters?.createdAt;
        if (!createdAt) return {};

        return {
            createdAt: {
                ...(createdAt.gte !== undefined && {
                    gte: new Date(String(createdAt.gte))
                }),
                ...(createdAt.gt !== undefined && {
                    gt: new Date(String(createdAt.gt))
                }),
                ...(createdAt.lte !== undefined && {
                    lte: new Date(String(createdAt.lte))
                }),
                ...(createdAt.lt !== undefined && {
                    lt: new Date(String(createdAt.lt))
                })
            }
        };
    }

    private buildDirectedPairs(animeIds: number[]): Array<{
        animeId: number;
        relatedAnimeId: number;
    }> {
        const uniqueIds = [...new Set(animeIds)];
        const pairs: Array<{
            animeId: number;
            relatedAnimeId: number;
        }> = [];

        for (const animeId of uniqueIds) {
            for (const relatedAnimeId of uniqueIds) {
                if (animeId === relatedAnimeId) continue;
                pairs.push({ animeId, relatedAnimeId });
            }
        }

        return pairs;
    }

    private async incrementRecommendationPairs(
        animeIds: number[],
        tx: any
    ): Promise<void> {
        const pairs = this.buildDirectedPairs(animeIds);

        for (const pair of pairs) {
            await tx.animePostRecommendation.upsert({
                where: {
                    animeId_relatedAnimeId: pair
                },
                update: {
                    relationCount: { increment: 1 }
                },
                create: {
                    ...pair,
                    relationCount: 1
                }
            });
        }
    }

    private async decrementRecommendationPairs(
        animeIds: number[],
        tx: any
    ): Promise<void> {
        const pairs = this.buildDirectedPairs(animeIds);

        for (const pair of pairs) {
            await tx.animePostRecommendation.updateMany({
                where: {
                    ...pair,
                    relationCount: { gt: 0 }
                },
                data: {
                    relationCount: { decrement: 1 }
                }
            });
        }

        const uniqueIds = [...new Set(animeIds)];
        await tx.animePostRecommendation.deleteMany({
            where: {
                relationCount: { lte: 0 },
                animeId: { in: uniqueIds }
            }
        });
    }

    private async incrementWeeklyPostActivity(
        animeIds: number[],
        createdAt: Date,
        tx: any
    ): Promise<void> {
        const weekStart = getUtcWeekStart(createdAt);
        const uniqueIds = [...new Set(animeIds)];

        for (const animeId of uniqueIds) {
            await tx.animeWeeklyActivity.upsert({
                where: {
                    animeId_weekStart: { animeId, weekStart }
                },
                update: {
                    postCount: { increment: 1 },
                    score: { increment: ANIME_WEEKLY_POST_WEIGHT }
                },
                create: {
                    animeId,
                    weekStart,
                    postCount: 1,
                    animeLikeCount: 0,
                    score: ANIME_WEEKLY_POST_WEIGHT
                }
            });
        }
    }

    private async decrementWeeklyPostActivity(
        animeIds: number[],
        createdAt: Date,
        tx: any
    ): Promise<void> {
        const weekStart = getUtcWeekStart(createdAt);
        const uniqueIds = [...new Set(animeIds)];

        for (const animeId of uniqueIds) {
            await tx.animeWeeklyActivity.updateMany({
                where: {
                    animeId,
                    weekStart,
                    postCount: { gt: 0 }
                },
                data: {
                    postCount: { decrement: 1 },
                    score: { decrement: ANIME_WEEKLY_POST_WEIGHT }
                }
            });
        }
    }

    async create(
        userId: number,
        title: string,
        description: string | null,
        photo: string | null,
        animeIds: number[]
    ): Promise<Post> {
        try {
            const uniqueMalIds = [...new Set(animeIds)];

            const post = await this.db.$transaction(
                async (tx: any) => {
                    const createdPost = await tx.post.create({
                        data: {
                            userId,
                            title,
                            description,
                            photo,
                            likes: 0,
                            ...(uniqueMalIds.length > 0 && {
                                animes: {
                                    create: uniqueMalIds.map(
                                        (malId) => ({
                                            anime: {
                                                connect: {
                                                    malId
                                                }
                                            }
                                        })
                                    )
                                }
                            })
                        },
                        include: POST_INCLUDE
                    });

                    await this.incrementRecommendationPairs(
                        createdPost.animes.map(
                            (animePost: any) => animePost.animeId
                        ),
                        tx
                    );

                    await this.incrementWeeklyPostActivity(
                        createdPost.animes.map(
                            (animePost: any) => animePost.animeId
                        ),
                        createdPost.createdAt,
                        tx
                    );

                    return createdPost;
                }
            );

            return Post.fromPersistence(post);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findById(id: number): Promise<Post | null> {
        try {
            const post = await this.db.post.findUnique({
                where: { postId: id },
                include: POST_INCLUDE
            });

            return post ? Post.fromPersistence(post) : null;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async find(
        findOptions: FindOptions
    ): Promise<FindRepository<Post>> {
        try {
            const { skip, take, orderBy } =
                buildPrismaPageQueryArray(findOptions, 'postId');
            const where = this.buildWhere(findOptions);

            const [posts, total] = await Promise.all([
                this.db.post.findMany({
                    where,
                    skip,
                    take,
                    orderBy,
                    include: POST_INCLUDE
                }),
                this.db.post.count({ where })
            ]);

            const formattedPosts = posts.map((post: any) =>
                Post.fromPersistence(post)
            );

            return {
                data: formattedPosts,
                total
            };
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findPopularWeekly(limit: number): Promise<Post[]> {
        try {
            const weekStart = getUtcWeekStart();
            const grouped = await this.db.userLikePost.groupBy({
                by: ['postId'],
                where: { createdAt: { gte: weekStart } },
                _count: { postId: true },
                orderBy: { _count: { postId: 'desc' } },
                take: limit
            });

            const postIds = grouped.map((item: any) => item.postId);
            if (postIds.length === 0) return [];

            const posts = await this.db.post.findMany({
                where: { postId: { in: postIds } },
                include: POST_INCLUDE
            });

            const byId = new Map(
                posts.map((post: any) => [post.postId, post])
            );

            return postIds
                .map((postId: number) => byId.get(postId))
                .filter(Boolean)
                .map((post: any) => Post.fromPersistence(post));
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findByUsername(
        username: string,
        findOptions: FindOptions
    ): Promise<FindRepository<Post>> {
        try {
            const { skip, take, orderBy } =
                buildPrismaPageQueryArray(findOptions, 'postId');

            const [posts, total] = await Promise.all([
                this.db.post.findMany({
                    where: {
                        user: {
                            username: {
                                equals: username,
                                mode: 'insensitive'
                            }
                        }
                    },
                    skip,
                    take,
                    orderBy,
                    include: POST_INCLUDE
                }),
                this.db.post.count({
                    where: {
                        user: {
                            username: {
                                equals: username,
                                mode: 'insensitive'
                            }
                        }
                    }
                })
            ]);

            const formattedPosts = posts.map((post: any) =>
                Post.fromPersistence(post)
            );

            return {
                data: formattedPosts,
                total
            };
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async delete(where: PostWhereUnique): Promise<boolean> {
        try {
            await this.db.$transaction(async (tx: any) => {
                const post = await tx.post.findUnique({
                    where,
                    select: { createdAt: true }
                });

                const animePosts = await tx.animePost.findMany({
                    where,
                    select: { animeId: true }
                });

                const animeIds = animePosts.map(
                    (animePost: { animeId: number }) =>
                        animePost.animeId
                );

                await this.decrementRecommendationPairs(
                    animeIds,
                    tx
                );

                if (post) {
                    await this.decrementWeeklyPostActivity(
                        animeIds,
                        post.createdAt,
                        tx
                    );
                }

                await tx.post.delete({ where });
            });
            return true;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findByMalId(
        malId: number,
        findOptions: FindOptions
    ): Promise<FindRepository<Post>> {
        try {
            const { skip, take, orderBy } =
                buildPrismaPageQueryArray(findOptions, 'postId');

            const [posts, total] = await Promise.all([
                this.db.post.findMany({
                    where: {
                        animes: {
                            some: {
                                anime: {
                                    malId
                                }
                            }
                        }
                    },
                    skip,
                    take,
                    orderBy,
                    include: POST_INCLUDE
                }),
                this.db.post.count({
                    where: {
                        animes: {
                            some: {
                                anime: {
                                    malId
                                }
                            }
                        }
                    }
                })
            ]);

            const formattedPosts = posts.map((post: any) =>
                Post.fromPersistence(post)
            );

            return {
                data: formattedPosts,
                total
            };
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async searchByTitle(
        query: string,
        limit: number
    ): Promise<Post[]> {
        try {
            const posts = await this.db.post.findMany({
                where: {
                    title: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                take: limit,
                include: POST_INCLUDE
            });

            return posts.map((post: any) =>
                Post.fromPersistence(post)
            );
        } catch (error) {
            handlePrismaError(error);
        }
    }
}
