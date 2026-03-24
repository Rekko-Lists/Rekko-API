import { Pagination } from '../types/Pagination';
import { Filter } from './filters/Filter';

export interface Repository<T, Id, F extends string = string> {
    create(entity: T): Promise<void>;
    findById(id: Id): Promise<T | null>;
    find(
        filters?: Filter<F>[],
        pagination?: Pagination
    ): Promise<T[]>;
    update(id: Id, entity: T): Promise<T | null>;
    delete(id: Id): Promise<boolean>;
    exists(id: Id): Promise<boolean>;
}
