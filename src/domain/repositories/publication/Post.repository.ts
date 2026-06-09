import { Post } from '../../entities/Post';
import {
    FindOptions,
    FindRepository
} from '../../schemas/find.schemas';
import { PostWhereUnique } from '../../schemas/publication/post.schemas';

export interface PostRepository {
    create(
        userId: number,
        title: string,
        description: string | null,
        photo: string | null,
        animeIds: number[]
    ): Promise<Post>;

    findById(
        id: number,
        fields?: string[]
    ): Promise<Post | null>;

    findByUsername(
        username: string,
        findOptions: FindOptions
    ): Promise<FindRepository<Post>>;

    findByMalId(
        malId: number,
        findOptions: FindOptions
    ): Promise<FindRepository<Post>>;

    find(
        findOptions: FindOptions
    ): Promise<FindRepository<Post>>;

    findPopularWeekly(limit: number): Promise<Post[]>;

    delete(where: PostWhereUnique): Promise<boolean>;

    searchByTitle(query: string, limit: number): Promise<Post[]>;
}
