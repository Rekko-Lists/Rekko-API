import { Comment } from '../../entities/Comment';
import {
    FindOptions,
    FindRepository
} from '../../schemas/find.schemas';

export interface CommentRepository {
    create(
        userId: number,
        postId: number,
        message: string,
        parentCommentId?: number | null
    ): Promise<Comment>;

    findById(
        id: number,
        fields?: string[]
    ): Promise<Comment | null>;

    delete(id: number): Promise<boolean>;

    findByPostId(
        postId: number,
        findOptions: FindOptions
    ): Promise<FindRepository<Comment>>;

    findReplies(
        parentCommentId: number,
        findOptions: FindOptions
    ): Promise<FindRepository<Comment>>;
}
