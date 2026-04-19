import { RefreshToken } from '../../domain/entities/RefreshToken';
import { User } from '../../domain/entities/User';
import { RefreshTokenRepository } from '../../domain/repositories/user/RefreshToken.repository';
import { UserRepository } from '../../domain/repositories/user/User.repository';
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken
} from '../../utils/jwt.util';
import {
    InvalidTokenError,
    UserNotFoundError
} from '../../domain/errors/auth.errors';
import {
    TokenPair,
    SessionInfo
} from '../../domain/schemas/user.schemas';

export class RefreshTokenService {
    constructor(
        private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly userRepository: UserRepository<User>
    ) {}

    async generateTokenPair(
        userId: number,
        userAgent: string,
        ip: string
    ): Promise<TokenPair> {
        const { accessToken, refreshToken, tokenEntity } =
            await this.generateTokens(userId, userAgent, ip);

        await this.refreshTokenRepository.persistRefreshToken(
            tokenEntity
        );

        return { accessToken, refreshToken };
    }

    async refreshAccessToken(
        refreshTokenString: string,
        userAgent: string,
        ip: string
    ): Promise<TokenPair> {
        const now = new Date();

        const decoded = verifyRefreshToken(refreshTokenString);

        const storedToken =
            await this.refreshTokenRepository.findActiveSessionByToken(
                refreshTokenString,
                now
            );

        if (!storedToken) {
            throw new InvalidTokenError(
                'Refresh token not found or expired'
            );
        }

        const userId = decoded.userId;

        const { accessToken, refreshToken, tokenEntity } =
            await this.generateTokens(userId, userAgent, ip);

        const rotated =
            await this.refreshTokenRepository.atomicRotateSession(
                refreshTokenString,
                tokenEntity,
                now
            );

        if (!rotated) {
            throw new InvalidTokenError(
                'Failed to rotate refresh token'
            );
        }

        return {
            accessToken,
            refreshToken
        };
    }

    async revokeTokenById(sessionId: number): Promise<void> {
        const token =
            await this.refreshTokenRepository.findSessionById(
                sessionId
            );

        if (!token) {
            throw new InvalidTokenError('Session not found');
        }

        const revoked =
            await this.refreshTokenRepository.revokeSessionById(
                sessionId,
                new Date()
            );

        if (!revoked) {
            throw new InvalidTokenError(
                'Failed to revoke session'
            );
        }
    }

    async revokeDevice(
        userId: number,
        userAgent: string,
        ip: string
    ): Promise<number> {
        const revokedAt = new Date();
        return await this.refreshTokenRepository.revokeSessionsByDevice(
            userId,
            userAgent,
            ip,
            revokedAt
        );
    }

    async revokeAllUserSessions(
        userId: number
    ): Promise<number> {
        const sessions =
            await this.refreshTokenRepository.findAllActiveSessionsByUserId(
                userId
            );

        const revokedAt = new Date();
        let count = 0;

        for (const session of sessions) {
            const result =
                await this.refreshTokenRepository.revokeSessionsByDevice(
                    userId,
                    session.getUserAgent(),
                    session.getIp(),
                    revokedAt
                );
            count += result;
        }

        return count;
    }

    async getActiveSessionsForUser(
        userId: number
    ): Promise<SessionInfo[]> {
        const tokens =
            await this.refreshTokenRepository.findAllActiveSessionsByUserId(
                userId
            );

        return tokens.map((token: RefreshToken) => ({
            sessionId: token.getRefreshTokenId(),
            userId: token.getUserId(),
            userAgent: token.getUserAgent(),
            ip: token.getIp(),
            createdAt: token.getCreatedAt(),
            expiresAt: token.getExpiresAt()
        }));
    }

    async getSessionInfo(
        sessionId: number
    ): Promise<SessionInfo | null> {
        const token =
            await this.refreshTokenRepository.findSessionById(
                sessionId
            );

        if (!token) return null;

        return {
            sessionId: token.getRefreshTokenId(),
            userId: token.getUserId(),
            userAgent: token.getUserAgent(),
            ip: token.getIp(),
            createdAt: token.getCreatedAt(),
            expiresAt: token.getExpiresAt()
        };
    }

    private async generateTokens(
        userId: number,
        userAgent: string,
        ip: string
    ) {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new UserNotFoundError('User not found');

        const accessToken = signAccessToken(userId);
        const refreshToken = signRefreshToken(userId);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const tokenEntity = RefreshToken.create(
            userId,
            refreshToken,
            expiresAt,
            userAgent,
            ip
        );

        return { accessToken, refreshToken, tokenEntity };
    }
}
