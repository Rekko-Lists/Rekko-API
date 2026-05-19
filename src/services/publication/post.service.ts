import { PostRepository } from '../../domain/repositories/publication/Post.repository';
import { CommentRepository } from '../../domain/repositories/Comment.repository';
import { Post } from '../../domain/entities/Post';
import {
    FindOptions,
    PaginatedResponse
} from '../../domain/schemas/find.schemas';
import {
    NotFoundError,
    AuthorizationError
} from '../../exceptions/exceptions';
import { CloudinaryHandler } from '../../infraestructure/services/storage/cloudinary.service';
import { CreatePostInput } from '../../domain/schemas/publication/post.schemas';
import { IMAGE_CONFIG } from '../../domain/schemas/img.schema';
import { LikeService } from './like.service';

export class PostService {
    constructor(
        private readonly postRepository: PostRepository,
        private readonly commentRepository: CommentRepository,
        private readonly cloudinaryHandler: CloudinaryHandler,
        private readonly likeService: LikeService
    ) {}

    async createPost(
        userId: number,
        input: CreatePostInput,
        file?: Express.Multer.File
    ): Promise<Post> {
        let photoUrl: string | null = null;

        if (file) {
            const publicId =
                this.cloudinaryHandler.buildPublicId(
                    'posts',
                    userId,
                    'postImage'
                );
            const result =
                await this.cloudinaryHandler.uploadAndProcessImage(
                    file.buffer,
                    IMAGE_CONFIG.postImage.width,
                    IMAGE_CONFIG.postImage.height,
                    '',
                    publicId
                );
            photoUrl = result.url;
        }

        const post = await this.postRepository.create(
            userId,
            input.title,
            input.description || null,
            photoUrl,
            input.animeIds || []
        );

        return post;
    }

    async getPosts(
        findOptions: FindOptions
    ): Promise<PaginatedResponse<Post>> {
        const result =
            await this.postRepository.find(findOptions);

        if (
            !result ||
            !result.data ||
            result.data.length === 0
        ) {
            throw new NotFoundError('No posts found');
        }

        const maxPages = Math.ceil(
            result.total / findOptions.pagination.limit
        );

        if (findOptions.pagination.page > maxPages) {
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

    async getPostById(postId: number): Promise<Post> {
        const post = await this.postRepository.findById(postId);

        if (!post) {
            throw new NotFoundError('Post', postId);
        }

        return post;
    }

    async deletePost(
        postId: number,
        userId: number
    ): Promise<void> {
        const post = await this.postRepository.findById(postId);
        if (!post || post.getUserId() !== userId) {
            throw new AuthorizationError(
                'Cannot delete this post'
            );
        }

        const deleted = await this.postRepository.delete({
            postId
        });

        if (!deleted) {
            throw new NotFoundError('Post', postId);
        }
    }

    async getPostsByUsername(
        username: string,
        findOptions: FindOptions
    ): Promise<PaginatedResponse<Post>> {
        const result = await this.postRepository.findByUsername(
            username,
            findOptions
        );

        if (
            !result ||
            !result.data ||
            result.data.length === 0
        ) {
            throw new NotFoundError(
                `No posts found for user ${username}`
            );
        }

        const maxPages = Math.ceil(
            result.total / findOptions.pagination.limit
        );

        if (findOptions.pagination.page > maxPages) {
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

    async getPostsByMalId(
        malId: number,
        findOptions: FindOptions
    ): Promise<PaginatedResponse<Post>> {
        const result = await this.postRepository.findByMalId(
            malId,
            findOptions
        );

        if (
            !result ||
            !result.data ||
            result.data.length === 0
        ) {
            throw new NotFoundError(
                `No posts found for anime ${malId}`
            );
        }

        const maxPages = Math.ceil(
            result.total / findOptions.pagination.limit
        );

        if (findOptions.pagination.page > maxPages) {
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

    async enrichPostWithLikesStatus(
        post: Post,
        userId?: number
    ): Promise<any> {
        const hasLiked = await this.likeService.hasUserLikedPost(
            post.getPostId(),
            userId
        );

        return {
            postId: post.getPostId(),
            title: post.getTitle(),
            description: post.getDescription(),
            photo: post.getPhoto(),
            likes: post.getLikes(),
            userId: post.getUserId(),
            user: post.getUser(),
            hasLiked
        };
    }

    async enrichPostsWithLikesStatus(
        posts: Post[],
        userId?: number
    ): Promise<any[]> {
        return Promise.all(
            posts.map((post) =>
                this.enrichPostWithLikesStatus(post, userId)
            )
        );
    }
}
