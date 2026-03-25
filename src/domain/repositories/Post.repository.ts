import { Post } from '../entities/Post';
import { Pagination } from '../types/pagination';
import { PostWithComments } from '../types/post.types';
import { Repository } from './repository';

export interface PostRepository extends Repository<Post> {
    findByUserId(
        userId: number,
        pagination: Pagination
    ): Promise<Post[]>;

    findFeed(pagination: Pagination): Promise<Post[]>;

    incrementLikes(postId: number): Promise<void>;

    decrementLikes(postId: number): Promise<void>;

    findWithComments(
        postId: number
    ): Promise<PostWithComments | null>;
}
