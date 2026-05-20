import { Comment } from '../../../../domain/entities/Comment';
import {
    FindOptions,
    FindRepository
} from '../../../../domain/schemas/find.schemas';
import { prisma } from '../../../database/prisma.client';
import { handlePrismaError } from '../../../errors/prisma.errors';
import { buildPrismaPageQuery } from '../../../../utils/prisma/prismaHelper';

export class CommentPrismaRepository {
    constructor(private readonly db = prisma) {}

    async create(
        userId: number,
        postId: number,
        message: string,
        parentCommentId: number | null = null
    ): Promise<Comment> {
        try {
            const comment = await this.db.comment.create({
                data: {
                    userId,
                    postId,
                    message,
                    parentCommentId,
                    likes: 0
                }
            });

            return Comment.fromPersistence(comment);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findById(id: number): Promise<Comment | null> {
        try {
            const comment = await this.db.comment.findUnique({
                where: { commentId: id }
            });

            return comment
                ? Comment.fromPersistence(comment)
                : null;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            await this.deleteRepliesRecursive(id);
            return true;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    private deleteRepliesRecursive = async (
        commentId: number
    ) => {
        const replies = await this.db.comment.findMany({
            where: { parentCommentId: commentId }
        });

        for (const reply of replies) {
            await this.deleteRepliesRecursive(reply.commentId);
        }

        await this.db.comment.delete({
            where: { commentId }
        });
    };

    async findByPostId(
        postId: number,
        findOptions: FindOptions
    ): Promise<FindRepository<Comment>> {
        try {
            const { skip, take, orderBy } = buildPrismaPageQuery(
                findOptions,
                'commentId'
            );

            const [comments, total] = await Promise.all([
                this.db.comment.findMany({
                    where: {
                        postId,
                        parentCommentId: null
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
                        },
                        replies: true
                    }
                }),
                this.db.comment.count({
                    where: {
                        postId,
                        parentCommentId: null
                    }
                })
            ]);

            return {
                data: this.formatComments(comments),
                total
            };
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findReplies(
        parentCommentId: number,
        findOptions: FindOptions
    ): Promise<FindRepository<Comment>> {
        try {
            const { skip, take, orderBy } = buildPrismaPageQuery(
                findOptions,
                'commentId'
            );

            const [comments, total] = await Promise.all([
                this.db.comment.findMany({
                    where: {
                        parentCommentId
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
                        },
                        replies: true
                    }
                }),
                this.db.comment.count({
                    where: {
                        parentCommentId
                    }
                })
            ]);

            return {
                data: this.formatComments(comments),
                total
            };
        } catch (error) {
            handlePrismaError(error);
        }
    }

    private formatComments(comments: any[]): Comment[] {
        return comments.map((comment: any) => {
            const replyCount = comment.replies?.length || 0;
            return Comment.fromPersistence({
                commentId: comment.commentId,
                userId: comment.userId,
                postId: comment.postId,
                parentCommentId: comment.parentCommentId,
                message: comment.message,
                likes: comment.likes,
                user: comment.user
                    ? {
                          username: comment.user.username,
                          profileImage: comment.user.profileImage
                      }
                    : undefined,
                hasReplies: replyCount > 0,
                replyCount
            });
        });
    }
}
