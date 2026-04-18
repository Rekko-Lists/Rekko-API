import {
    UserUpdateProfile,
    UserUpdateSocialAccounts,
    UserWhereUnique
} from '../../schemas/user.schemas';
import { Repository } from '../repository';

export interface UserRepository<User> extends Repository<
    User,
    UserWhereUnique,
    UserUpdateProfile
> {
    findByUsername(username: string): Promise<User | null>;

    updateUsername(
        userId: number,
        username: string
    ): Promise<User | null>;

    updateRole(
        userId: number,
        role: string
    ): Promise<User | null>;

    updateReputation(
        userId: number,
        increment: number
    ): Promise<User | null>;

    socialAccounts(
        userId: number,
        socialAccounts: UserUpdateSocialAccounts
    ): Promise<User | null>;
}
