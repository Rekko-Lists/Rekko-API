import { Comment } from '../entities/Comment';
import { Pagination } from '../types/pagination';
import { Repository } from './repository';

export interface CommentRepository extends Repository<Comment> {
    findByPostId(
        postId: number,
        pagination: Pagination
    ): Promise<Comment[]>;

    findReplies(parentCommentId: number): Promise<Comment[]>;

    countByPostId(postId: number): Promise<Comment[]>;

    incrementLikes(commentId: number): Promise<void>;

    decrementLikes(commentId: number): Promise<void>;
}

/**
 *CommentRepository

findByPostId(postId, pagination): Promise<Comment[]>

findReplies(parentCommentId): Promise<Comment[]>

countByPostId(postId): Promise<number>

incrementLikes(commentId): Promise<void>

deleteThread(commentId): Promise<number>
 */
