import { Pagination } from '../types/pagination';
import { Filter } from './filters/filter';

export interface Repository<T, F extends string = string> {
    create(entity: T): Promise<void>;

    findById(id: number): Promise<T | null>;

    find(
        filters?: Filter<F>[],
        pagination?: Pagination
    ): Promise<T[]>;

    update(id: number, entity: T): Promise<T | null>;

    delete(id: number): Promise<boolean>;

    exists(id: number): Promise<boolean>;
}
