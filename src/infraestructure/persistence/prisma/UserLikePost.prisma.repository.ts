import { UserLikePostRepository } from '../../../domain/repositories/UserLikePost.repository';

export class UserLikePostPrismaRepository implements UserLikePostRepository {
    exists(userId: number, postId: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    add(userId: number, postId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
    remove(userId: number, postId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
