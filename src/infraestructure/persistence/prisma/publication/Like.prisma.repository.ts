import { LikeRepository } from '../../../../domain/repositories/publication/Like.repository';
import {
    FindOptions,
    FindRepository
} from '../../../../domain/schemas/find.schemas';
import {
    LikedAnimeListItem,
    LikedPostListItem
} from '../../../../domain/schemas/publication/like.schemas';
import { buildPrismaPageQueryArray } from '../../../../utils/prisma/prismaHelper';
import { prisma } from '../../../database/prisma.client';
import { handlePrismaError } from '../../../errors/prisma.errors';

export class LikePrismaRepository implements LikeRepository {
    constructor(private readonly db = prisma) {}

    private toLikedAnimeListItem(
        record: any
    ): LikedAnimeListItem {
        return {
            userLikeAnimeId: record.userLikeAnimeId,
            userId: record.userId,
            animeId: record.animeId,
            anime: {
                malId: record.anime.malId,
                name: record.anime.name,
                synopsis: record.anime.synopsis,
                imgMedium: record.anime.imgMedium,
                imgLarge: record.anime.imgLarge,
                startDate: record.anime.startDate,
                endDate: record.anime.endDate,
                malMean: record.anime.malMean,
                malRank: record.anime.malRank,
                mean: record.anime.mean,
                numEpisodes: record.anime.numEpisodes,
                status: record.anime.status,
                mediaType: record.anime.mediaType,
                nextUpdate: record.anime.nextUpdate,
                likes: record.anime.likes,
                genres:
                    record.anime.animeGenres?.map(
                        (animeGenre: any) =>
                            animeGenre.genre.name
                    ) ?? [],
                studios: record.anime.studios,
                broadcast: {
                    dayOfWeek: record.anime.broadcast.dayOfWeek,
                    startTime: record.anime.broadcast.startTime
                }
            }
        };
    }

    private toLikedPostListItem(record: any): LikedPostListItem {
        return {
            userLikePostId: record.userLikePostId,
            userId: record.userId,
            postId: record.postId,
            post: {
                postId: record.post.postId,
                userId: record.post.userId,
                title: record.post.title,
                description: record.post.description,
                photo: record.post.photo,
                likes: record.post.likes,
                user: record.post.user
            }
        };
    }

    async hasUserLikedPost(
        postId: number,
        userId: number
    ): Promise<boolean> {
        try {
            const like = await this.db.userLikePost.findUnique({
                where: { userId_postId: { userId, postId } }
            });
            return !!like;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findLikedPostIdsByUser(
        postIds: number[],
        userId: number
    ): Promise<Set<number>> {
        try {
            const records = await this.db.userLikePost.findMany({
                where: { userId, postId: { in: postIds } },
                select: { postId: true }
            });
            return new Set(records.map((r: any) => r.postId));
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async createPostLike(
        postId: number,
        userId: number
    ): Promise<void> {
        try {
            await this.db.$transaction([
                this.db.userLikePost.create({
                    data: { postId, userId }
                }),
                this.db.post.update({
                    where: { postId },
                    data: { likes: { increment: 1 } }
                })
            ]);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async removePostLike(
        postId: number,
        userId: number
    ): Promise<void> {
        try {
            await this.db.$transaction(async (tx: typeof this.db) => {
                const { count } =
                    await tx.userLikePost.deleteMany({
                        where: { postId, userId }
                    });
                if (count > 0) {
                    await tx.post.update({
                        where: { postId },
                        data: { likes: { decrement: 1 } }
                    });
                }
            });
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async hasUserLikedComment(
        commentId: number,
        userId: number
    ): Promise<boolean> {
        try {
            const like =
                await this.db.userLikeComment.findUnique({
                    where: {
                        userId_commentId: { userId, commentId }
                    }
                });
            return !!like;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findLikedCommentIdsByUser(
        commentIds: number[],
        userId: number
    ): Promise<Set<number>> {
        try {
            const records =
                await this.db.userLikeComment.findMany({
                    where: {
                        userId,
                        commentId: { in: commentIds }
                    },
                    select: { commentId: true }
                });
            return new Set(
                records.map((r: any) => r.commentId)
            );
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async createCommentLike(
        commentId: number,
        userId: number
    ): Promise<void> {
        try {
            await this.db.$transaction([
                this.db.userLikeComment.create({
                    data: { commentId, userId }
                }),
                this.db.comment.update({
                    where: { commentId },
                    data: { likes: { increment: 1 } }
                })
            ]);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async removeCommentLike(
        commentId: number,
        userId: number
    ): Promise<void> {
        try {
            await this.db.$transaction(async (tx: typeof this.db) => {
                const { count } =
                    await tx.userLikeComment.deleteMany({
                        where: { commentId, userId }
                    });
                if (count > 0) {
                    await tx.comment.update({
                        where: { commentId },
                        data: { likes: { decrement: 1 } }
                    });
                }
            });
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async hasUserLikedAnime(
        animeId: number,
        userId: number
    ): Promise<boolean> {
        try {
            const like = await this.db.userLikeAnime.findUnique({
                where: { userId_animeId: { userId, animeId } }
            });
            return !!like;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async createAnimeLike(
        animeId: number,
        userId: number
    ): Promise<void> {
        try {
            await this.db.$transaction([
                this.db.userLikeAnime.create({
                    data: { animeId, userId }
                }),
                this.db.anime.update({
                    where: { animeId },
                    data: { likes: { increment: 1 } }
                })
            ]);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async removeAnimeLike(
        animeId: number,
        userId: number
    ): Promise<void> {
        try {
            await this.db.$transaction(async (tx: typeof this.db) => {
                const { count } =
                    await tx.userLikeAnime.deleteMany({
                        where: { animeId, userId }
                    });
                if (count > 0) {
                    await tx.anime.update({
                        where: { animeId },
                        data: { likes: { decrement: 1 } }
                    });
                }
            });
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findLikedAnimesByUserId(
        userId: number,
        findOptions: FindOptions
    ): Promise<FindRepository<LikedAnimeListItem>> {
        try {
            const { skip, take, orderBy } =
                buildPrismaPageQueryArray(
                    findOptions,
                    'userLikeAnimeId'
                );

            const [records, total] = await Promise.all([
                this.db.userLikeAnime.findMany({
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
                this.db.userLikeAnime.count({
                    where: { userId }
                })
            ]);

            return {
                data: records.map((record: any) =>
                    this.toLikedAnimeListItem(record)
                ),
                total
            };
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findLikedPostsByUserId(
        userId: number,
        findOptions: FindOptions
    ): Promise<FindRepository<LikedPostListItem>> {
        try {
            const { skip, take, orderBy } =
                buildPrismaPageQueryArray(
                    findOptions,
                    'userLikePostId'
                );

            const [records, total] = await Promise.all([
                this.db.userLikePost.findMany({
                    where: { userId },
                    skip,
                    take,
                    orderBy,
                    include: {
                        post: {
                            include: {
                                user: {
                                    select: {
                                        username: true,
                                        profileImage: true
                                    }
                                }
                            }
                        }
                    }
                }),
                this.db.userLikePost.count({
                    where: { userId }
                })
            ]);

            return {
                data: records.map((record: any) =>
                    this.toLikedPostListItem(record)
                ),
                total
            };
        } catch (error) {
            handlePrismaError(error);
        }
    }
}
