import { User } from '../../../domain/entities/User';
import { handlePrismaError } from '../../../domain/errors/prisma.errors';
import { Filter } from '../../../domain/repositories/filters/filter';
import { UserRepository } from '../../../domain/repositories/User.repository';
import { Pagination } from '../../../domain/types/pagination';
import {
    UserUpdateProfile,
    UserWhereUnique
} from '../../../domain/types/user.types';
import { prisma } from './../../database/prisma.client';

export class UserPrismaRepository implements UserRepository<User> {
    constructor(private readonly db = prisma) {}

    async create(entity: User): Promise<void> {
        try {
            await this.db.user.create({
                data: {
                    email: entity.getEmail(),
                    username: entity.getUsername(),
                    password: entity.getPasswordHash(),
                    biography: entity.getBiography() ?? null,
                    profileImage:
                        entity.getProfileImage() ?? null,
                    bannerImage: entity.getBannerImage() ?? null,
                    backgroundImage:
                        entity.getBackgroundImage() ?? null
                }
            });
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findById(id: number): Promise<User | null> {
        try {
            const user = await this.db.user.findUnique({
                where: { userId: id }
            });

            return user;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async find(
        filters?: Filter<string>[] | undefined,
        pagination?: Pagination
    ): Promise<User[]> {
        try {
            const users = await this.db.user.findMany();

            return users;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async update(
        where: UserWhereUnique,
        entity: UserUpdateProfile
    ): Promise<User | null> {
        try {
            const data: UserUpdateProfile = {};

            if (entity.biography !== undefined) {
                data.biography = entity.biography;
            }

            if (entity.profileImage !== undefined) {
                data.profileImage = entity.profileImage;
            }

            if (entity.bannerImage !== undefined) {
                data.bannerImage = entity.bannerImage;
            }

            if (entity.backgroundImage !== undefined) {
                data.backgroundImage = entity.backgroundImage;
            }

            const user = await this.db.user.update({
                data,
                where
            });

            return user;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async delete(where: UserWhereUnique): Promise<boolean> {
        try {
            const result = await this.db.user.deleteMany({
                where
            });

            return result.count > 0;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            const user = await this.db.user.findUnique({
                where: { email: email }
            });

            return user;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findByUsername(
        username: string
    ): Promise<User | null> {
        try {
            const user = await this.db.user.findUnique({
                where: { username }
            });

            return user;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    updateEmail(
        userId: number,
        newEmail: string
    ): Promise<User | null> {
        throw new Error('Method not implemented.');
    }

    updateUsername(
        userId: number,
        username: string
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
