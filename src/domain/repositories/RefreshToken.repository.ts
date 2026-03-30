import { RefreshToken } from '../entities/RefreshToken';
import { Repository } from './repository';

export interface RefreshTokenRepository extends Repository<RefreshToken> {
    findActiveByToken(
        token: string,
        now: Date
    ): Promise<RefreshToken | null>;

    existsActiveToken(
        token: string,
        now: Date
    ): Promise<boolean>;

    rotate(
        oldToken: string,
        newToken: RefreshToken,
        revokedAt: Date
    ): Promise<boolean>;

    revokeByUserAndDevice(
        userId: number,
        userAgent: string,
        ip: string,
        revokedAt: Date
    ): Promise<number>;

    deleteRevokedOlderThan(cutDate: Date): Promise<number>;
}
