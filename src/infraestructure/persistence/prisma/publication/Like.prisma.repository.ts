import { LikeRepository } from '../../../../domain/repositories/publication/Like.repository';
import { prisma } from '../../../database/prisma.client';
import { handlePrismaError } from '../../../errors/prisma.errors';

export class LikePrismaRepository implements LikeRepository {
    constructor(private readonly db = prisma) {}

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
}
