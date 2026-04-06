import { Pagination } from '../types/pagination';
import { Filter } from './filters/filter';

export interface Repository<
    T,
    F extends string = string,
    WUnique = unknown,
    UpdateDTO = unknown
> {
    create(entity: T): Promise<void>;

    findById(id: number): Promise<T | null>;

    find(
        filters?: Filter<F>[],
        pagination?: Pagination
    ): Promise<T[]>;

    update(where: WUnique, entity: UpdateDTO): Promise<T | null>;

    delete(where: WUnique): Promise<boolean>;
}
