import { SocialAccount } from '../entities/SocialAccount';
import { UserHasSocialAccount } from '../entities/UserHasSocialAccount';
import { Repository } from './repository';

export interface UserHasSocialAccountRepository extends Repository<UserHasSocialAccount> {
    findByUserId(
        userId: number
    ): Promise<SocialAccount[]>;
}
