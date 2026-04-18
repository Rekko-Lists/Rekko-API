import {
    FindOptions,
    FindRepository
} from '../schemas/find.schemas';

export interface Repository<
    T,
    WUnique = unknown,
    UpdateDTO = unknown
> {
    create(entity: T): Promise<T | null>;

    findById(id: number, fields?: string[]): Promise<T | null>;

    find(findOptions: FindOptions): Promise<FindRepository<T>>;

    update(where: WUnique, entity: UpdateDTO): Promise<T | null>;

    delete(where: WUnique): Promise<boolean>;
}
