import { LikeRepository } from '../../domain/repositories/publication/Like.repository';
import { PostRepository } from '../../domain/repositories/publication/Post.repository';
import { Post } from '../../domain/entities/Post';
import {
    ConflictError,
    NotFoundError
} from '../../exceptions/exceptions';

export class LikeService {
    constructor(
        private readonly likeRepository: LikeRepository,
        private readonly postRepository: PostRepository
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
}
