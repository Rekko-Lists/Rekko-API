import { OAuthAccount } from '../../../domain/entities/OAuthAccount';
import { Filter } from '../../../domain/repositories/filters/filter';
import { OAuthAccountRepository } from '../../../domain/repositories/OAuthAccount.repository';
import { LinkOAuthAccount } from '../../../domain/types/oauthaccount.types';
import { Pagination } from '../../../domain/types/pagination';

export class OAuthAccountPrismaRepository implements OAuthAccountRepository {
    create(entity: OAuthAccount): Promise<void> {
        throw new Error('Method not implemented.');
    }

    findById(id: number): Promise<OAuthAccount | null> {
        throw new Error('Method not implemented.');
    }

    find(
        filters?: Filter<string>[] | undefined,
        pagination?: Pagination
    ): Promise<OAuthAccount[]> {
        throw new Error('Method not implemented.');
    }

    update(
        id: number,
        entity: OAuthAccount
    ): Promise<OAuthAccount | null> {
        throw new Error('Method not implemented.');
    }

    delete(id: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    findByProviderAndProviderUserId(
        provider: string,
        providerUserId: number
    ): Promise<OAuthAccount | null> {
        throw new Error('Method not implemented.');
    }

    findByUserId(
        userId: number
    ): Promise<OAuthAccount[] | null> {
        throw new Error('Method not implemented.');
    }

    linkAccount(
        account: LinkOAuthAccount
    ): Promise<OAuthAccount> {
        throw new Error('Method not implemented.');
    }

    unlinkAccount(
        userId: number,
        provider: string
    ): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    updateAccessToken(
        oauthAccountId: number,
        accessToken: string
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
