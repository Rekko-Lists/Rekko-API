import { User } from '../../../../domain/entities/User';
import { handlePrismaError } from '../../../errors/prisma.errors';
import { UserRepository } from '../../../../domain/repositories/user/User.repository';
import {
    UserUpdateProfile,
    UserUpdateSocialAccounts,
    UserWhereUnique
} from '../../../../domain/schemas/user/user.schemas';
import { prisma } from '../../../database/prisma.client';
import {
    FindOptions,
    FindRepository
} from '../../../../domain/schemas/find.schemas';
import {
    userDefaultSelect,
    userFieldMappings
} from '../../../../domain/schemas/user/user.schemas';
import {
    buildPrismaSelect,
    buildPrismaPageQuery
} from '../../../../utils/prisma/prismaHelper';

export class UserPrismaRepository implements UserRepository<User> {
    constructor(private readonly db = prisma) {}

    async create(entity: User): Promise<User | null> {
        try {
            const user = await this.db.user.create({
                data: {
                    email: entity.getEmail(),
                    username: entity.getUsername(),
                    password: entity.getPasswordHash(),
                    biography: entity.getBiography() ?? null,
                    profileImage: ''
                }
            });

            return User.fromPersistence(user);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findById(
        id: number,
        fields: string[]
    ): Promise<User | null> {
        try {
            const prismaSelect = buildPrismaSelect(
                userDefaultSelect,
                userFieldMappings,
                fields
            );

            const user = await this.db.user.findUnique({
                where: { userId: id },
                select: prismaSelect
            });

            if (!user) return null;

            return User.fromPersistence(user);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async find(
        findOptions: FindOptions
    ): Promise<FindRepository<User>> {
        try {
            const { select } = findOptions;

            const prismaSelect = buildPrismaSelect(
                userDefaultSelect,
                userFieldMappings,
                select
            );

            const { skip, take, orderBy } = buildPrismaPageQuery(
                findOptions,
                'username'
            );

            const [users, total] = await Promise.all([
                this.db.user.findMany({
                    select: prismaSelect,
                    skip,
                    take,
                    orderBy
                }),
                this.db.user.count()
            ]);

            const formattedUsers = users.map((user: any) => {
                return User.fromPersistence(user);
            });

            return {
                data: formattedUsers as any,
                total
            };
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async update(
        where: UserWhereUnique,
        entity: UserUpdateProfile
    ): Promise<User | null> {
        try {
            const user = await this.db.user.update({
                data: entity,
                where
            });

            return User.fromPersistence(user);
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

    async findByUsername(
        username: string
    ): Promise<User | null> {
        try {
            const user = await this.db.user.findUnique({
                where: { username },
                include: {
                    userSocialAccount: {
                        include: {
                            socialAccount: true
                        }
                    }
                }
            });

            if (!user) return null;

            return User.fromPersistence(user);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            const user = await this.db.user.findUnique({
                where: { email }
            });

            if (!user) return null;

            return User.fromPersistence(user);
        } catch (error) {
            handlePrismaError(error);
        }
    }
    async updateUsername(
        userId: number,
        username: string
    ): Promise<User | null> {
        try {
            const user = await this.db.user.update({
                data: { username },
                where: { userId }
            });

            return User.fromPersistence(user);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async updateRole(
        userId: number,
        role: string
    ): Promise<User | null> {
        try {
            const user = await this.db.user.update({
                data: { role },
                where: { userId }
            });

            return User.fromPersistence(user);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async updateReputation(
        userId: number,
        increment: number
    ): Promise<User | null> {
        try {
            const user = await this.db.user.findUnique({
                where: { userId }
            });

            const userPersistence = User.fromPersistence(user);

            await this.db.user.update({
                data: {
                    reputation:
                        userPersistence.getReputation() +
                        increment
                },
                where: { userId }
            });

            return User.fromPersistence(user);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async socialAccounts(
        userId: number,
        socialAccounts: UserUpdateSocialAccounts
    ): Promise<User | null> {
        try {
            const user = await this.db.$transaction(async (tx: any) => {
                for (const account of socialAccounts.accounts) {
                    const sa = await tx.socialAccount.upsert({
                        where: { name: account.name },
                        create: { name: account.name },
                        update: {}
                    });

                    await tx.userSocialAccount.upsert({
                        where: {
                            userId_socialAccountId: {
                                userId,
                                socialAccountId: sa.socialAccountId
                            }
                        },
                        update: { socialUrl: account.url },
                        create: {
                            userId,
                            socialAccountId: sa.socialAccountId,
                            socialUrl: account.url
                        }
                    });
                }

                return tx.user.findUnique({
                    where: { userId },
                    include: {
                        userSocialAccount: {
                            include: { socialAccount: true }
                        }
                    }
                });
            });

            return user ? User.fromPersistence(user) : null;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async searchByName(
        query: string,
        limit: number
    ): Promise<User[]> {
        try {
            const users = await this.db.user.findMany({
                where: {
                    username: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                take: limit
            });

            return users.map((user: any) =>
                User.fromPersistence(user)
            );
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async resetStreak(userId: number): Promise<User | null> {
        try {
            // streakUpdatedAt vuelve a null para no bloquear que el usuario
            // gane racha hoy: tras un reset, completar el reto empieza en 1.
            const user = await this.db.user.update({
                data: {
                    streak: 0,
                    streakUpdatedAt: null
                },
                where: { userId }
            });

            return User.fromPersistence(user);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async setStreak(
        userId: number,
        streak: number,
        streakUpdatedAt: Date
    ): Promise<User | null> {
        try {
            const user = await this.db.user.update({
                data: { streak, streakUpdatedAt },
                where: { userId }
            });

            return User.fromPersistence(user);
        } catch (error) {
            handlePrismaError(error);
        }
    }
}
