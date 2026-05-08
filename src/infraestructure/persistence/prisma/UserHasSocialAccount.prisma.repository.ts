import { SocialAccount } from '../../../domain/entities/SocialAccount';
import { UserHasSocialAccount } from '../../../domain/entities/UserHasSocialAccount';
import { UserHasSocialAccountRepository } from '../../../domain/repositories/UserHasSocialAccount.repository';
import { FindOptions, FindRepository } from '../../../domain/schemas/find.schemas';

export class UserHasSocialAccountPrismaRepository implements UserHasSocialAccountRepository {
    create(entity: UserHasSocialAccount): Promise<UserHasSocialAccount | null> {
        throw new Error('Method not implemented.');
    }

    findById(id: number): Promise<UserHasSocialAccount | null> {
        throw new Error('Method not implemented.');
    }

    find(findOptions: FindOptions): Promise<FindRepository<UserHasSocialAccount>> {
        throw new Error('Method not implemented.');
    }

    update(id: number, entity: UserHasSocialAccount): Promise<UserHasSocialAccount | null> {
        throw new Error('Method not implemented.');
    }

    delete(id: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    findByUserId(userId: number): Promise<SocialAccount[]> {
        throw new Error('Method not implemented.');
    }
}
