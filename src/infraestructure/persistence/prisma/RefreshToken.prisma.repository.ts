import { RefreshToken } from '../../../domain/entities/RefreshToken';
import { Filter } from '../../../domain/repositories/filters/filter';
import { RefreshTokenRepository } from '../../../domain/repositories/RefreshToken.repository';
import { Pagination } from '../../../domain/schemas/pagination.schemas';

export class RefreshTokenPrismaRepository implements RefreshTokenRepository {
    create(entity: RefreshToken): Promise<void> {
        throw new Error('Method not implemented.');
    }

    findById(id: number): Promise<RefreshToken | null> {
        throw new Error('Method not implemented.');
    }

    find(
        filters?: Filter<string>[] | undefined,
        pagination?: Pagination
    ): Promise<RefreshToken[]> {
        throw new Error('Method not implemented.');
    }

    update(
        id: number,
        entity: RefreshToken
    ): Promise<RefreshToken | null> {
        throw new Error('Method not implemented.');
    }

    delete(id: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    findActiveByToken(
        token: string,
        now: Date
    ): Promise<RefreshToken | null> {
        throw new Error('Method not implemented.');
    }

    existsActiveToken(
        token: string,
        now: Date
    ): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    rotate(
        oldToken: string,
        newToken: RefreshToken,
        revokedAt: Date
    ): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    revokeByUserAndDevice(
        userId: number,
        userAgent: string,
        ip: string,
        revokedAt: Date
    ): Promise<number> {
        throw new Error('Method not implemented.');
    }

    deleteRevokedOlderThan(cutDate: Date): Promise<number> {
        throw new Error('Method not implemented.');
    }
}
