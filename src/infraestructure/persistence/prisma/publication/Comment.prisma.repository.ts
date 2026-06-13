import { Comment } from '../../../../domain/entities/Comment';
import { CommentRepository } from '../../../../domain/repositories/publication/Comment.repository';
import {
    FindOptions,
    FindRepository
} from '../../../../domain/schemas/find.schemas';
import { prisma } from '../../../database/prisma.client';
import { handlePrismaError } from '../../../errors/prisma.errors';
import { buildPrismaPageQuery } from '../../../../utils/prisma/prismaHelper';

export class CommentPrismaRepository implements CommentRepository {
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
            // The DB cascade (onDelete: Cascade on parentComment relation)
            // handles recursive deletion of all replies atomically.
            await this.db.comment.delete({
                where: { commentId: id }
            });
            return true;
        } catch (error) {
            handlePrismaError(error);
        }
    }

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
                        _count: {
                            select: { replies: true }
                        }
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
                        _count: {
                            select: { replies: true }
                        }
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

    async findThreadByPostId(
        postId: number,
        findOptions: FindOptions
    ): Promise<{
        topLevel: Comment[];
        descendants: Comment[];
        total: number;
    }> {
        try {
            const { skip, take, orderBy } = buildPrismaPageQuery(
                findOptions,
                'commentId'
            );

            const include = {
                user: {
                    select: {
                        username: true,
                        profileImage: true
                    }
                },
                _count: {
                    select: { replies: true }
                }
            } as const;

            // Top-level comments are paginated; every reply of the post is
            // fetched once so the service can assemble each root's full subtree
            // in memory without an extra round-trip per nesting level.
            const [topLevel, total, descendants] =
                await Promise.all([
                    this.db.comment.findMany({
                        where: { postId, parentCommentId: null },
                        skip,
                        take,
                        orderBy,
                        include
                    }),
                    this.db.comment.count({
                        where: {
                            postId,
                            parentCommentId: null
                        }
                    }),
                    this.db.comment.findMany({
                        where: {
                            postId,
                            parentCommentId: { not: null }
                        },
                        orderBy: { commentId: 'asc' },
                        include
                    })
                ]);

            return {
                topLevel: this.formatComments(topLevel),
                descendants: this.formatComments(descendants),
                total
            };
        } catch (error) {
            handlePrismaError(error);
        }
    }

    private formatComments(comments: any[]): Comment[] {
        return comments.map((comment: any) => {
            const replyCount = comment._count?.replies || 0;
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
