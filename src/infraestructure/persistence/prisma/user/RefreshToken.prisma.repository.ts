import { RefreshToken } from '../../../../domain/entities/RefreshToken';
import { RefreshTokenRepository } from '../../../../domain/repositories/user/RefreshToken.repository';
import { prisma } from '../../../database/prisma.client';
import { handlePrismaError } from '../../../../domain/errors/prisma.errors';

export class RefreshTokenPrismaRepository implements RefreshTokenRepository {
    constructor(private readonly db = prisma) {}

    async persistRefreshToken(
        tokenEntity: RefreshToken
    ): Promise<RefreshToken | null> {
        try {
            const created = await this.db.refreshToken.create({
                data: {
                    userId: tokenEntity.getUserId(),
                    token: tokenEntity.getToken(),
                    expiresAt: tokenEntity.getExpiresAt(),
                    revokedAt: null,
                    userAgent: tokenEntity.getUserAgent(),
                    ip: tokenEntity.getIp()
                }
            });

            return RefreshToken.fromPersistence(created);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findSessionById(
        sessionId: number
    ): Promise<RefreshToken | null> {
        try {
            const token = await this.db.refreshToken.findUnique({
                where: { refreshTokenId: sessionId }
            });

            if (!token) return null;
            return RefreshToken.fromPersistence(token);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findActiveSessionByToken(
        tokenString: string,
        currentTimestamp: Date
    ): Promise<RefreshToken | null> {
        try {
            const refreshToken =
                await this.db.refreshToken.findFirst({
                    where: {
                        token: tokenString,
                        expiresAt: { gt: currentTimestamp },
                        revokedAt: null
                    }
                });

            if (!refreshToken) return null;
            return RefreshToken.fromPersistence(refreshToken);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async atomicRotateSession(
        expiredTokenString: string,
        newRefreshToken: RefreshToken,
        revocationTimestamp: Date
    ): Promise<boolean> {
        try {
            await this.db.$transaction(async (tx: any) => {
                await tx.refreshToken.updateMany({
                    where: { token: expiredTokenString },
                    data: { revokedAt: revocationTimestamp }
                });

                await tx.refreshToken.create({
                    data: {
                        userId: newRefreshToken.getUserId(),
                        token: newRefreshToken.getToken(),
                        expiresAt:
                            newRefreshToken.getExpiresAt(),
                        userAgent:
                            newRefreshToken.getUserAgent(),
                        ip: newRefreshToken.getIp()
                    }
                });
            });
            return true;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async revokeSessionsByDevice(
        userId: number,
        deviceUserAgent: string,
        deviceIpAddress: string,
        revocationTimestamp: Date
    ): Promise<number> {
        try {
            const result = await this.db.refreshToken.updateMany(
                {
                    where: {
                        userId: userId,
                        userAgent: deviceUserAgent,
                        ip: deviceIpAddress,
                        revokedAt: null
                    },
                    data: { revokedAt: revocationTimestamp }
                }
            );

            return result.count;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async revokeSessionById(
        sessionId: number,
        revocationTimestamp: Date
    ): Promise<boolean> {
        try {
            const result = await this.db.refreshToken.update({
                where: { refreshTokenId: sessionId },
                data: { revokedAt: revocationTimestamp }
            });

            return !!result;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findAllActiveSessionsByUserId(
        userId: number
    ): Promise<RefreshToken[]> {
        try {
            const tokens = await this.db.refreshToken.findMany({
                where: {
                    userId: userId,
                    revokedAt: null,
                    expiresAt: { gt: new Date() }
                }
            });

            return tokens.map((t: any) =>
                RefreshToken.fromPersistence(t)
            );
        } catch (error) {
            handlePrismaError(error);
        }
    }
}
