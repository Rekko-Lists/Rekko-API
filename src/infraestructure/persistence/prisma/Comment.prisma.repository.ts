import { Comment } from '../../../domain/entities/Comment';
import { CommentRepository } from '../../../domain/repositories/Comment.repository';
import { Filter } from '../../../domain/repositories/filters/filter';
import { Pagination } from '../../../domain/schemas/pagination.schemas';

export class CommentPrismaRepository implements CommentRepository {
    create(entity: Comment): Promise<void> {
        throw new Error('Method not implemented.');
    }

    findById(id: number): Promise<Comment | null> {
        throw new Error('Method not implemented.');
    }

    find(
        filters?: Filter<string>[] | undefined,
        pagination?: Pagination
    ): Promise<Comment[]> {
        throw new Error('Method not implemented.');
    }

    update(
        id: number,
        entity: Comment
    ): Promise<Comment | null> {
        throw new Error('Method not implemented.');
    }

    delete(id: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    findByPostId(
        postId: number,
        pagination: Pagination
    ): Promise<Comment[]> {
        throw new Error('Method not implemented.');
    }

    findReplies(parentCommentId: number): Promise<Comment[]> {
        throw new Error('Method not implemented.');
    }

    countByPostId(postId: number): Promise<Comment[]> {
        throw new Error('Method not implemented.');
    }

    incrementLikes(commentId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    decrementLikes(commentId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
