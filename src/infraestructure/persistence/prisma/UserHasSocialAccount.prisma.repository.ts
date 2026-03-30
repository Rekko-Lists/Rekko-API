import { SocialAccount } from '../../../domain/entities/SocialAccount';
import { UserHasSocialAccount } from '../../../domain/entities/UserHasSocialAccount';
import { Filter } from '../../../domain/repositories/filters/filter';
import { UserHasSocialAccountRepository } from '../../../domain/repositories/UserHasSocialAccount.repository';
import { Pagination } from '../../../domain/types/pagination';

export class UserHasSocialAccountPrismaRepository implements UserHasSocialAccountRepository {
    create(entity: UserHasSocialAccount): Promise<void> {
        throw new Error('Method not implemented.');
    }

    findById(id: number): Promise<UserHasSocialAccount | null> {
        throw new Error('Method not implemented.');
    }

    find(
        filters?: Filter<string>[] | undefined,
        pagination?: Pagination
    ): Promise<UserHasSocialAccount[]> {
        throw new Error('Method not implemented.');
    }

    update(
        id: number,
        entity: UserHasSocialAccount
    ): Promise<UserHasSocialAccount | null> {
        throw new Error('Method not implemented.');
    }

    delete(id: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    findByUserId(userId: number): Promise<SocialAccount[]> {
        throw new Error('Method not implemented.');
    }
}
