import { Comment } from '../../domain/entities/Comment';
import { CommentRepository } from '../../domain/repositories/publication/Comment.repository';
import { PostRepository } from '../../domain/repositories/publication/Post.repository';
import {
    FindOptions,
    PaginatedResponse
} from '../../domain/schemas/find.schemas';
import {
    NotFoundError,
    ValidationError,
    AuthorizationError
} from '../../exceptions/exceptions';
import {
    CreateCommentInput,
    EnrichedComment
} from '../../domain/schemas/publication/comment.schemas';
import { LikeService } from './like.service';

export class CommentService {
    constructor(
        private readonly commentRepository: CommentRepository,
        private readonly postRepository: PostRepository,
        private readonly likeService: LikeService
    ) {}

    async createComment(
        userId: number,
        input: CreateCommentInput
    ): Promise<Comment> {
        const post = await this.postRepository.findById(
            input.postId
        );

        if (!post) {
            throw new NotFoundError('Post not found');
        }

        if (input.parentCommentId) {
            const parentComment =
                await this.commentRepository.findById(
                    input.parentCommentId
                );

            if (!parentComment) {
                throw new NotFoundError(
                    'Parent comment not found'
                );
            }

            if (parentComment.getPostId() !== input.postId) {
                throw new ValidationError(
                    'Parent comment does not belong to this post'
                );
            }
        }

        const comment = await this.commentRepository.create(
            userId,
            input.postId,
            input.message,
            input.parentCommentId || null
        );

        return comment;
    }

    async deleteComment(
        commentId: number,
        userId: number
    ): Promise<boolean> {
        const comment =
            await this.commentRepository.findById(commentId);

        if (!comment) {
            throw new NotFoundError('Comment not found');
        }

        const commentUserId = comment.getUserId();
        if (commentUserId !== null && commentUserId !== userId) {
            throw new AuthorizationError(
                'You do not have permission to delete this comment'
            );
        }

        return await this.commentRepository.delete(commentId);
    }

    async getCommentsByPostId(
        postId: number,
        findOptions: FindOptions
    ): Promise<PaginatedResponse<Comment>> {
        const post = await this.postRepository.findById(postId);

        if (!post) {
            throw new NotFoundError('Post not found');
        }

        const result = await this.commentRepository.findByPostId(
            postId,
            findOptions
        );

        const maxPages = Math.ceil(
            result.total / findOptions.pagination.limit
        );

        if (
            maxPages > 0 &&
            findOptions.pagination.page > maxPages
        ) {
            throw new NotFoundError(
                `Page ${findOptions.pagination.page} does not exist. Max pages: ${maxPages}`
            );
        }

        return {
            data: result.data,
            pagination: {
                page: findOptions.pagination.page,
                limit: findOptions.pagination.limit,
                total: result.total,
                pages: maxPages
            }
        };
    }

    async getCommentsByParentId(
        parentId: number,
        findOptions: FindOptions
    ): Promise<PaginatedResponse<Comment>> {
        const parentComment =
            await this.commentRepository.findById(parentId);

        if (!parentComment) {
            throw new NotFoundError('Parent comment not found');
        }

        const result = await this.commentRepository.findReplies(
            parentId,
            findOptions
        );

        const maxPages = Math.ceil(
            result.total / findOptions.pagination.limit
        );

        if (
            maxPages > 0 &&
            findOptions.pagination.page > maxPages
        ) {
            throw new NotFoundError(
                `Page ${findOptions.pagination.page} does not exist. Max pages: ${maxPages}`
            );
        }

        return {
            data: result.data,
            pagination: {
                page: findOptions.pagination.page,
                limit: findOptions.pagination.limit,
                total: result.total,
                pages: maxPages
            }
        };
    }

    private toEnrichedComment(
        comment: Comment,
        hasLiked: boolean
    ): EnrichedComment {
        return {
            commentId: comment.getCommentId(),
            message: comment.getMessage(),
            likes: comment.getLikes(),
            userId: comment.getUserId(),
            user: comment.getUser(),
            postId: comment.getPostId(),
            parentCommentId: comment.getParentCommentId(),
            replyCount: comment.getReplyCount(),
            hasReplies: comment.getHasReplies(),
            hasLiked
        };
    }

    async enrichCommentWithLikesStatus(
        comment: Comment,
        userId?: number
    ): Promise<EnrichedComment> {
        const hasLiked =
            await this.likeService.hasUserLikedComment(
                comment.getCommentId(),
                userId
            );
        return this.toEnrichedComment(comment, hasLiked);
    }

    async enrichCommentsWithLikesStatus(
        comments: Comment[],
        userId?: number
    ): Promise<EnrichedComment[]> {
        if (comments.length === 0) return [];

        const likedIds = userId
            ? await this.likeService.getLikedCommentIds(
                  comments.map((c) => c.getCommentId()),
                  userId
              )
            : new Set<number>();

        return comments.map((comment) =>
            this.toEnrichedComment(
                comment,
                likedIds.has(comment.getCommentId())
            )
        );
    }
}
