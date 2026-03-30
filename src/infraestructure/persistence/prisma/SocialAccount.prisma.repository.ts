import { SocialAccount } from '../../../domain/entities/SocialAccount';
import { Filter } from '../../../domain/repositories/filters/filter';
import { Repository } from '../../../domain/repositories/repository';
import { Pagination } from '../../../domain/types/pagination';

export class SocialAccountPrismaRepository implements Repository<SocialAccount> {
    create(entity: SocialAccount): Promise<void> {
        throw new Error('Method not implemented.');
    }

    findById(id: number): Promise<SocialAccount | null> {
        throw new Error('Method not implemented.');
    }

    find(
        filters?: Filter<string>[] | undefined,
        pagination?: Pagination
    ): Promise<SocialAccount[]> {
        throw new Error('Method not implemented.');
    }

    update(
        id: number,
        entity: SocialAccount
    ): Promise<SocialAccount | null> {
        throw new Error('Method not implemented.');
    }

    delete(id: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}
