import { User } from '../../../../domain/entities/User';
import { handlePrismaError } from '../../../../domain/errors/prisma.errors';
import { UserRepository } from '../../../../domain/repositories/user/User.repository';
import {
    UserUpdateProfile,
    UserUpdateSocialAccounts,
    UserWhereUnique
} from '../../../../domain/schemas/user.schemas';
import { prisma } from '../../../database/prisma.client';
import {
    FindOptions,
    FindRepository
} from '../../../../domain/schemas/find.schemas';
import {
    userDefaultSelect,
    userFieldMappings
} from '../../../../domain/schemas/user.schemas';
import { buildPrismaSelect } from '../../../../utils/buildPrismaSelect.util';

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
                    profileImage:
                        entity.getProfileImage() ?? null,
                    bannerImage: entity.getBannerImage() ?? null,
                    backgroundImage:
                        entity.getBackgroundImage() ?? null
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

            return this.formatUserSocialAccounts(user);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async find(
        findOptions: FindOptions
    ): Promise<FindRepository<User>> {
        try {
            const { select, pagination, sort } = findOptions;

            const prismaSelect = buildPrismaSelect(
                userDefaultSelect,
                userFieldMappings,
                select
            );
            const skip =
                (pagination.page - 1) * pagination.limit;
            const take = pagination.limit;

            const orderBy = sort
                ? { [sort.field]: sort.order }
                : { userId: 'asc' };

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
                return this.formatUserSocialAccounts(user);
            });

            return {
                data: formattedUsers as any,
                total
            };
        } catch (error) {
            handlePrismaError(error);
        }
    }

    private formatUserSocialAccounts(user: any) {
        if (user.userSocialAccount) {
            user.socialAccounts = user.userSocialAccount.map(
                (usa: any) => ({
                    name: usa.socialAccount.name,
                    url: usa.socialUrl
                })
            );
            delete user.userSocialAccount;
        }

        return user;
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
            const socialAccountsData = await Promise.all(
                socialAccounts.accounts.map(async (account) => {
                    const sa =
                        await this.db.socialAccount.upsert({
                            where: { name: account.name },
                            create: { name: account.name },
                            update: {}
                        });
                    return {
                        socialAccountId: sa.socialAccountId,
                        url: account.url
                    };
                })
            );

            for (const {
                socialAccountId,
                url
            } of socialAccountsData) {
                const existing =
                    await this.db.userSocialAccount.findFirst({
                        where: { userId, socialAccountId }
                    });

                if (existing) {
                    await this.db.userSocialAccount.update({
                        where: {
                            userSocialAccountId:
                                existing.userSocialAccountId
                        },
                        data: { socialUrl: url }
                    });
                } else {
                    await this.db.userSocialAccount.create({
                        data: {
                            userId,
                            socialAccountId,
                            socialUrl: url
                        }
                    });
                }
            }

            return await this.db.user.findUnique({
                where: { userId }
            });
        } catch (error) {
            handlePrismaError(error);
        }
    }
}
