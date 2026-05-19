import { Post } from '../../../../domain/entities/Post';
import { PostRepository } from '../../../../domain/repositories/publication/Post.repository';
import {
    FindOptions,
    FindRepository
} from '../../../../domain/schemas/find.schemas';
import { PostWhereUnique } from '../../../../domain/schemas/publication/post.schemas';
import { prisma } from '../../../database/prisma.client';
import { handlePrismaError } from '../../../errors/prisma.errors';

export class PostPrismaRepository implements PostRepository {
    constructor(private readonly db = prisma) {}

    async create(
        userId: number,
        title: string,
        description: string | null,
        photo: string | null,
        animeIds: number[]
    ): Promise<Post> {
        try {
            const post = await this.db.post.create({
                data: {
                    userId,
                    title,
                    description,
                    photo,
                    likes: 0,
                    ...(animeIds.length > 0 && {
                        animes: {
                            create: animeIds.map((malId) => ({
                                anime: {
                                    connect: { malId }
                                }
                            }))
                        }
                    })
                }
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
                include: {
                    user: {
                        select: {
                            username: true,
                            profileImage: true
                        }
                    }
                }
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
            const { pagination, sort } = findOptions;
            const skip =
                (pagination.page - 1) * pagination.limit;
            const take = pagination.limit;

            const orderBy =
                sort && sort.length > 0
                    ? { [sort[0].field]: sort[0].order }
                    : { postId: 'desc' };

            const [posts, total] = await Promise.all([
                this.db.post.findMany({
                    skip,
                    take,
                    orderBy,
                    include: {
                        user: {
                            select: {
                                username: true,
                                profileImage: true
                            }
                        }
                    }
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
            const { pagination, sort } = findOptions;
            const skip =
                (pagination.page - 1) * pagination.limit;
            const take = pagination.limit;

            const orderBy =
                sort && sort.length > 0
                    ? { [sort[0].field]: sort[0].order }
                    : { postId: 'desc' };

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
                    include: {
                        user: {
                            select: {
                                username: true,
                                profileImage: true
                            }
                        }
                    }
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
            await this.db.post.delete({ where });
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
            const { pagination, sort } = findOptions;
            const skip =
                (pagination.page - 1) * pagination.limit;
            const take = pagination.limit;

            const orderBy =
                sort && sort.length > 0
                    ? { [sort[0].field]: sort[0].order }
                    : { postId: 'desc' };

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
                    include: {
                        user: {
                            select: {
                                username: true,
                                profileImage: true
                            }
                        }
                    }
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
