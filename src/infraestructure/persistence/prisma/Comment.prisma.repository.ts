import { Comment } from '../../../domain/entities/Comment';
import { CommentRepository } from '../../../domain/repositories/Comment.repository';
import { FindOptions, FindRepository } from '../../../domain/schemas/find.schemas';
import { Pagination } from '../../../domain/types/pagination';

export class CommentPrismaRepository implements CommentRepository {
    create(entity: Comment): Promise<Comment | null> {
        throw new Error('Method not implemented.');
    }

    findById(id: number): Promise<Comment | null> {
        throw new Error('Method not implemented.');
    }

    find(findOptions: FindOptions): Promise<FindRepository<Comment>> {
        throw new Error('Method not implemented.');
    }

    update(id: number, entity: Comment): Promise<Comment | null> {
        throw new Error('Method not implemented.');
    }

    delete(id: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    findByPostId(postId: number, pagination: Pagination): Promise<Comment[]> {
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
