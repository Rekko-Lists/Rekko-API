import { User } from '../../../domain/entities/User';
import { Filter } from '../../../domain/repositories/filters/filter';
import { UserRepository } from '../../../domain/repositories/User.repository';
import { Pagination } from '../../../domain/types/pagination';
import { UserUpdateProfile } from '../../../domain/types/user.types';
import { prisma } from './../../database/prisma.client';

export class UserPrismaRepository implements UserRepository<User> {
    constructor(private readonly db = prisma) {}

    async create(entity: User): Promise<void> {
        await this.db.user.create({
            data: {
                email: entity.getEmail(),
                username: entity.getUsername(),
                password: entity.getPasswordHash(),
                profileImage: entity.getProfileImage() ?? null,
                bannerImage: entity.getBannerImage() ?? null,
                backgroundImage:
                    entity.getBackgroundImage() ?? null
            }
        });
    }

    findById(id: number): Promise<User | null> {
        throw new Error('Method not implemented.');
    }

    find(
        filters?: Filter<string>[] | undefined,
        pagination?: Pagination
    ): Promise<User[]> {
        throw new Error('Method not implemented.');
    }

    update(id: number, entity: User): Promise<User | null> {
        throw new Error('Method not implemented.');
    }

    delete(id: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    findByEmail(email: string): Promise<User | null> {
        throw new Error('Method not implemented.');
    }

    async findByUsername(
        username: string
    ): Promise<User | null> {
        const user = await this.db.user.findUnique({
            where: { username }
        });
        return user;
    }

    existsByEmail(email: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    existsByUsername(username: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    updateProfile(
        userId: number,
        data: UserUpdateProfile
    ): Promise<User | null> {
        throw new Error('Method not implemented.');
    }

    updatePassword(
        userId: number,
        passwordHash: string
    ): Promise<User | null> {
        throw new Error('Method not implemented.');
    }

    updateRole(
        userId: number,
        role: string
    ): Promise<User | null> {
        throw new Error('Method not implemented.');
    }

    updateReputation(
        userId: number,
        increment: number
    ): Promise<User | null> {
        throw new Error('Method not implemented.');
    }
}
