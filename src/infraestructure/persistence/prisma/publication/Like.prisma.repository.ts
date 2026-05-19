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
}
