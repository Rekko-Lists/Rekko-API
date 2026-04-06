import {
    UserUpdateProfile,
    UserWhereUnique
} from '../types/user.types';
import { Repository } from './repository';

export interface UserRepository<User> extends Repository<
    User,
    string,
    UserWhereUnique,
    UserUpdateProfile
> {
    findByEmail(email: string): Promise<User | null>;

    findByUsername(username: string): Promise<User | null>;

    updateEmail(
        userId: number,
        newEmail: string
    ): Promise<User | null>;

    updateUsername(
        userId: number,
        username: string
    ): Promise<User | null>;

    updatePassword(
        userId: number,
        passwordHash: string
    ): Promise<User | null>;

    updateRole(
        userId: number,
        role: string
    ): Promise<User | null>;

    updateReputation(
        userId: number,
        increment: number
    ): Promise<User | null>;
}
