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
    }
} as const;

export class PostPrismaRepository implements PostRepository {
    constructor(private readonly db = prisma) {}

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

    async create(
        userId: number,
        title: string,
        description: string | null,
        photo: string | null,
        animeIds: number[]
    ): Promise<Post> {
        try {
            const uniqueMalIds = [...new Set(animeIds)];

            const post = await this.db.$transaction(async (tx: any) => {
                const createdPost = await tx.post.create({
                    data: {
                        userId,
                        title,
                        description,
                        photo,
                        likes: 0,
                        ...(uniqueMalIds.length > 0 && {
                            animes: {
                                create: uniqueMalIds.map((malId) => ({
                                    anime: {
                                        connect: { malId }
                                    }
                                }))
                            }
                        })
                    },
                    include: POST_INCLUDE
                });

                await this.incrementRecommendationPairs(
                    createdPost.animes.map((animePost: any) => animePost.animeId),
                    tx
                );

                return createdPost;
            });

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
            const { skip, take, orderBy } = buildPrismaPageQueryArray(
                findOptions,
                'postId'
            );

            const [posts, total] = await Promise.all([
                this.db.post.findMany({
                    skip,
                    take,
                    orderBy,
                    include: POST_INCLUDE
                }),
                this.db.post.count()
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

    async findByUsername(
        username: string,
        findOptions: FindOptions
    ): Promise<FindRepository<Post>> {
        try {
            const { skip, take, orderBy } = buildPrismaPageQueryArray(
                findOptions,
                'postId'
            );

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
                const animePosts = await tx.animePost.findMany({
                    where,
                    select: { animeId: true }
                });

                await this.decrementRecommendationPairs(
                    animePosts.map(
                        (animePost: { animeId: number }) =>
                            animePost.animeId
                    ),
                    tx
                );

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
            const { skip, take, orderBy } = buildPrismaPageQueryArray(
                findOptions,
                'postId'
            );

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
                include: {
                    user: {
                        select: {
                            username: true,
                            profileImage: true
                        }
                    }
                }
            });

            return posts.map((post: any) =>
                Post.fromPersistence(post)
            );
        } catch (error) {
            handlePrismaError(error);
        }
    }
}
