import { OAuth } from '../../../../domain/entities/OAuth';
import { handlePrismaError } from '../../../errors/prisma.errors';
import { OAuthRepository } from '../../../../domain/repositories/user/OAuth.repository';
import { prisma } from '../../../database/prisma.client';

export class OAuthPrismaRepository implements OAuthRepository<OAuth> {
    constructor(private readonly db = prisma) {}

    async link(account: OAuth): Promise<OAuth> {
        try {
            const oauth = await this.db.oAuthAccount.create({
                data: {
                    userId: account.getUserId(),
                    provider: account.getProvider(),
                    providerUserId: account.getProviderUserId()
                },
                include: { user: true }
            });

            return OAuth.fromPersistence(oauth);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findByProviderAndProviderUserId(
        provider: string,
        providerUserId: string
    ): Promise<OAuth | null> {
        try {
            const oauth = await this.db.oAuthAccount.findFirst({
                where: { provider, providerUserId }
            });

            if (!oauth) return null;
            return OAuth.fromPersistence(oauth);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findByUserId(userId: number): Promise<OAuth[] | null> {
        try {
            const accounts = await this.db.oAuthAccount.findMany(
                {
                    where: { userId }
                }
            );

            const oauth = accounts.map((e: any) => {
                return OAuth.fromPersistence(e);
            });

            return oauth;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async unlink(
        userId: number,
        provider: string
    ): Promise<boolean> {
        try {
            const result = await this.db.oAuthAccount.deleteMany(
                {
                    where: { userId, provider }
                }
            );

            return result.count > 0;
        } catch (error) {
            handlePrismaError(error);
        }
    }
}
