import { UserUpdateProfile } from '../types/user.types';
import { Repository } from './repository';

export interface UserRepository<User> extends Repository<User> {
    findByEmail(email: string): Promise<User | null>;

    findByUsername(username: string): Promise<User | null>;

    existsByEmail(email: string): Promise<boolean>;

    existsByUsername(username: string): Promise<boolean>;

    updateProfile(
        userId: number,
        data: UserUpdateProfile
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
