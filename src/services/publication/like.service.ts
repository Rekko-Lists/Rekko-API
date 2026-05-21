import { LikeRepository } from '../../domain/repositories/publication/Like.repository';
import { PostRepository } from '../../domain/repositories/publication/Post.repository';
import { CommentRepository } from '../../domain/repositories/publication/Comment.repository';
import { AnimeRepository } from '../../domain/repositories/anime/Anime.repository';
import { Post } from '../../domain/entities/Post';
import { Comment } from '../../domain/entities/Comment';
import { Anime } from '../../domain/entities/Anime';
import {
    ConflictError,
    NotFoundError
} from '../../exceptions/exceptions';
import {
    FindOptions,
    PaginatedResponse
} from '../../domain/schemas/find.schemas';
import {
    LikedAnimeListItem,
    LikedPostListItem
} from '../../domain/schemas/publication/like.schemas';

export class LikeService {
    constructor(
        private readonly likeRepository: LikeRepository,
        private readonly postRepository: PostRepository,
        private readonly commentRepository: CommentRepository,
        private readonly animeRepository: AnimeRepository
    ) {}

    async likePost(
        postId: number,
        userId: number
    ): Promise<Post> {
        const hasLiked =
            await this.likeRepository.hasUserLikedPost(
                postId,
                userId
            );

        if (hasLiked) {
            throw new ConflictError(
                `User ${userId} has already liked post ${postId}`
            );
        }

        await this.likeRepository.createPostLike(postId, userId);

        const updatedPost =
            await this.postRepository.findById(postId);

        if (!updatedPost) {
            throw new NotFoundError('Post', postId);
        }

        return updatedPost;
    }

    async unlikePost(
        postId: number,
        userId: number
    ): Promise<Post> {
        const hasLiked =
            await this.likeRepository.hasUserLikedPost(
                postId,
                userId
            );

        if (!hasLiked) {
            throw new ConflictError(
                `User ${userId} has not liked post ${postId}`
            );
        }

        await this.likeRepository.removePostLike(postId, userId);

        const updatedPost =
            await this.postRepository.findById(postId);

        if (!updatedPost) {
            throw new NotFoundError('Post', postId);
        }

        return updatedPost;
    }

    async hasUserLikedPost(
        postId: number,
        userId?: number
    ): Promise<boolean> {
        if (!userId) return false;
        return this.likeRepository.hasUserLikedPost(
            postId,
            userId
        );
    }

    async likeComment(
        commentId: number,
        userId: number
    ): Promise<Comment> {
        const hasLiked =
            await this.likeRepository.hasUserLikedComment(
                commentId,
                userId
            );

        if (hasLiked) {
            throw new ConflictError(
                `User ${userId} has already liked comment ${commentId}`
            );
        }

        await this.likeRepository.createCommentLike(
            commentId,
            userId
        );

        const updatedComment =
            await this.commentRepository.findById(commentId);

        if (!updatedComment) {
            throw new NotFoundError('Comment', commentId);
        }

        return updatedComment;
    }

    async unlikeComment(
        commentId: number,
        userId: number
    ): Promise<Comment> {
        const hasLiked =
            await this.likeRepository.hasUserLikedComment(
                commentId,
                userId
            );

        if (!hasLiked) {
            throw new ConflictError(
                `User ${userId} has not liked comment ${commentId}`
            );
        }

        await this.likeRepository.removeCommentLike(
            commentId,
            userId
        );

        const updatedComment =
            await this.commentRepository.findById(commentId);

        if (!updatedComment) {
            throw new NotFoundError('Comment', commentId);
        }

        return updatedComment;
    }

    async hasUserLikedComment(
        commentId: number,
        userId?: number
    ): Promise<boolean> {
        if (!userId) return false;
        return this.likeRepository.hasUserLikedComment(
            commentId,
            userId
        );
    }

    async likeAnime(
        malId: number,
        userId: number
    ): Promise<Anime> {
        const anime =
            await this.animeRepository.findByMalId(malId);

        if (!anime) {
            throw new NotFoundError(
                `Anime with MAL ID ${malId} not found`
            );
        }

        const animeId = anime.getAnimeId();

        const hasLiked =
            await this.likeRepository.hasUserLikedAnime(
                animeId,
                userId
            );

        if (hasLiked) {
            throw new ConflictError(
                `User ${userId} has already liked anime ${malId}`
            );
        }

        await this.likeRepository.createAnimeLike(
            animeId,
            userId
        );

        const updatedAnime =
            await this.animeRepository.findByMalId(malId);

        if (!updatedAnime) {
            throw new NotFoundError(
                `Anime with MAL ID ${malId} not found`
            );
        }

        return updatedAnime;
    }

    async unlikeAnime(
        malId: number,
        userId: number
    ): Promise<Anime> {
        const anime =
            await this.animeRepository.findByMalId(malId);

        if (!anime) {
            throw new NotFoundError(
                `Anime with MAL ID ${malId} not found`
            );
        }

        const animeId = anime.getAnimeId();

        const hasLiked =
            await this.likeRepository.hasUserLikedAnime(
                animeId,
                userId
            );

        if (!hasLiked) {
            throw new ConflictError(
                `User ${userId} has not liked anime ${malId}`
            );
        }

        await this.likeRepository.removeAnimeLike(
            animeId,
            userId
        );

        const updatedAnime =
            await this.animeRepository.findByMalId(malId);

        if (!updatedAnime) {
            throw new NotFoundError(
                `Anime with MAL ID ${malId} not found`
            );
        }

        return updatedAnime;
    }

    async hasUserLikedAnime(
        malId: number,
        userId?: number
    ): Promise<boolean> {
        if (!userId) return false;

        const anime =
            await this.animeRepository.findByMalId(malId);

        if (!anime) return false;

        return this.likeRepository.hasUserLikedAnime(
            anime.getAnimeId(),
            userId
        );
    }

    async getLikedAnimesByUserId(
        userId: number,
        findOptions: FindOptions
    ): Promise<PaginatedResponse<LikedAnimeListItem>> {
        const result =
            await this.likeRepository.findLikedAnimesByUserId(
                userId,
                findOptions
            );

        const pages = Math.ceil(
            result.total / findOptions.pagination.limit
        );

        return {
            data: result.data,
            pagination: {
                page: findOptions.pagination.page,
                limit: findOptions.pagination.limit,
                total: result.total,
                pages
            }
        };
    }

    async getLikedPostsByUserId(
        userId: number,
        findOptions: FindOptions
    ): Promise<PaginatedResponse<LikedPostListItem>> {
        const result =
            await this.likeRepository.findLikedPostsByUserId(
                userId,
                findOptions
            );

        const pages = Math.ceil(
            result.total / findOptions.pagination.limit
        );

        return {
            data: result.data,
            pagination: {
                page: findOptions.pagination.page,
                limit: findOptions.pagination.limit,
                total: result.total,
                pages
            }
        };
    }
}
