import { Post } from '../../../domain/entities/Post';
import { Filter } from '../../../domain/repositories/filters/filter';
import { PostRepository } from '../../../domain/repositories/Post.repository';
import { Pagination } from '../../../domain/schemas/pagination.schemas';
import { PostWithComments } from '../../../domain/schemas/post.schemas';

export class PostPrismaRepository implements PostRepository {
    create(entity: Post): Promise<void> {
        throw new Error('Method not implemented.');
    }

    findById(id: number): Promise<Post | null> {
        throw new Error('Method not implemented.');
    }

    find(
        filters?: Filter<string>[] | undefined,
        pagination?: Pagination
    ): Promise<Post[]> {
        throw new Error('Method not implemented.');
    }

    update(id: number, entity: Post): Promise<Post | null> {
        throw new Error('Method not implemented.');
    }

    delete(id: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    findByUserId(
        userId: number,
        pagination: Pagination
    ): Promise<Post[]> {
        throw new Error('Method not implemented.');
    }

    findFeed(pagination: Pagination): Promise<Post[]> {
        throw new Error('Method not implemented.');
    }

    incrementLikes(postId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    decrementLikes(postId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    findWithComments(
        postId: number
    ): Promise<PostWithComments | null> {
        throw new Error('Method not implemented.');
    }
}
