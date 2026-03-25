import { OAuthAccount } from '../entities/OAuthAccount';
import { LinkOAuthAccount } from '../types/oauthaccount.types';
import { Repository } from './repository';

export interface OAuthAccountRepository extends Repository<OAuthAccount> {
    findByProviderAndProviderUserId(
        provider: string,
        providerUserId: number
    ): Promise<OAuthAccount | null>;

    findByUserId(userId: number): Promise<OAuthAccount[] | null>;

    linkAccount(
        account: LinkOAuthAccount
    ): Promise<OAuthAccount>;

    unlinkAccount(
        userId: number,
        provider: string
    ): Promise<boolean>;

    updateAccessToken(
        oauthAccountId: number,
        accessToken: string
    ): Promise<void>;
}

/**
 * OAuthAccountRepository

findByProviderAndProviderUserId(provider, providerUserId): Promise<OAuthAccount | null>

findByUserId(userId): Promise<OAuthAccount[]>

linkAccount(account): Promise<OAuthAccount>

unlinkAccount(userId, provider): Promise<boolean>

updateAccessToken(accountId, accessToken): Promise<void>
 */
