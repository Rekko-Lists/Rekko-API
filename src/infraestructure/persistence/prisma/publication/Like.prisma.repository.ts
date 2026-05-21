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
            const like = await this.db.userLikePost.findFirst({
                where: { postId, userId }
            });
            return !!like;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async createPostLike(
        postId: number,
        userId: number
    ): Promise<void> {
        try {
            await this.db.userLikePost.create({
                data: { postId, userId }
            });

            await this.db.post.update({
                where: { postId },
                data: { likes: { increment: 1 } }
            });
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async removePostLike(
        postId: number,
        userId: number
    ): Promise<void> {
        try {
            await this.db.userLikePost.deleteMany({
                where: { postId, userId }
            });

            await this.db.post.update({
                where: { postId },
                data: { likes: { decrement: 1 } }
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
            const like = await this.db.userLikeComment.findFirst(
                {
                    where: { commentId, userId }
                }
            );
            return !!like;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async createCommentLike(
        commentId: number,
        userId: number
    ): Promise<void> {
        try {
            await this.db.userLikeComment.create({
                data: { commentId, userId }
            });

            await this.db.comment.update({
                where: { commentId },
                data: { likes: { increment: 1 } }
            });
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async removeCommentLike(
        commentId: number,
        userId: number
    ): Promise<void> {
        try {
            await this.db.userLikeComment.deleteMany({
                where: { commentId, userId }
            });

            await this.db.comment.update({
                where: { commentId },
                data: { likes: { decrement: 1 } }
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
            const like = await this.db.userLikeAnime.findFirst({
                where: { animeId, userId }
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
            await this.db.userLikeAnime.create({
                data: { animeId, userId }
            });

            await this.db.anime.update({
                where: { animeId },
                data: { likes: { increment: 1 } }
            });
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async removeAnimeLike(
        animeId: number,
        userId: number
    ): Promise<void> {
        try {
            await this.db.userLikeAnime.deleteMany({
                where: { animeId, userId }
            });

            await this.db.anime.update({
                where: { animeId },
                data: { likes: { decrement: 1 } }
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
