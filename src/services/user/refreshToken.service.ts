import { RefreshToken } from '../../domain/entities/RefreshToken';
import { User } from '../../domain/entities/User';
import { RefreshTokenRepository } from '../../domain/repositories/user/RefreshToken.repository';
import { UserRepository } from '../../domain/repositories/user/User.repository';
import { signAccessToken } from '../../utils/jwt.util';
import {
    InvalidTokenError,
    TokenExpiredError,
    UserNotFoundError
} from '../../domain/errors/auth.errors';
import {
    TokenPair,
    SessionInfo
} from '../../domain/schemas/user.schemas';
import { encodeRefreshToken } from '../../utils/refreshToken.util';

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

    async revokeSessionByToken(
        tokenString: string
    ): Promise<void> {
        const now = new Date();

        const token =
            await this.refreshTokenRepository.findActiveSessionByToken(
                tokenString,
                now
            );

        if (!token) {
            throw new InvalidTokenError(
                'Refresh token not found or already expired'
            );
        }

        const revoked =
            await this.refreshTokenRepository.revokeSessionById(
                token.getRefreshTokenId(),
                now
            );

        if (!revoked) {
            throw new InvalidTokenError(
                'Failed to revoke session'
            );
        }
    }

    async refreshAccessToken(
        refreshTokenString: string
    ): Promise<{ accessToken: string }> {
        const now = new Date();

        const storedToken =
            await this.refreshTokenRepository.findSessionByToken(
                refreshTokenString
            );

        if (
            !storedToken ||
            storedToken.getRevokedAt() !== null
        ) {
            throw new InvalidTokenError(
                'Refresh token is invalid'
            );
        }

        if (storedToken.getExpiresAt() < now) {
            throw new TokenExpiredError(
                'Refresh token has expired'
            );
        }

        const user = await this.userRepository.findById(
            storedToken.getUserId()
        );

        if (!user) {
            throw new UserNotFoundError('User not found');
        }

        const accessToken = signAccessToken(
            storedToken.getUserId()
        );

        return { accessToken };
    }

    private async generateTokens(
        userId: number,
        userAgent: string,
        ip: string
    ) {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new UserNotFoundError('User not found');

        const accessToken = signAccessToken(userId);
        const refreshToken = await encodeRefreshToken({
            username: user.getUsername(),
            userAgent,
            ip,
            timestamp: Math.floor(Date.now() / 1000)
        });

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

    /**
     * Estas funciones se usaran mas para adelante si al final
     * da tiempo de hacer mas cositas con las sesiones y porque
     * por tema de seguridad son interesantes.
     */
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
}
