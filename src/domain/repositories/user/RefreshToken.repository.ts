import { RefreshToken } from '../../entities/RefreshToken';

export interface RefreshTokenRepository {
    persistRefreshToken(
        tokenEntity: RefreshToken
    ): Promise<RefreshToken | null>;

    findActiveSessionByToken(
        tokenString: string,
        currentTimestamp: Date
    ): Promise<RefreshToken | null>;

    atomicRotateSession(
        expiredTokenString: string,
        newRefreshToken: RefreshToken,
        revocationTimestamp: Date
    ): Promise<boolean>;

    revokeSessionsByDevice(
        userId: number,
        deviceUserAgent: string,
        deviceIpAddress: string,
        revocationTimestamp: Date
    ): Promise<number>;

    revokeSessionById(
        sessionId: number,
        revocationTimestamp: Date
    ): Promise<boolean>;

    findAllActiveSessionsByUserId(
        userId: number
    ): Promise<RefreshToken[]>;

    findSessionById(
        sessionId: number
    ): Promise<RefreshToken | null>;
}
