export interface OAuthRepository<OAuth> {
    link(account: OAuth): Promise<OAuth>;

    unlink(userId: number, provider: string): Promise<boolean>;

    findByProviderAndProviderUserId(
        provider: string,
        providerUserId: string
    ): Promise<OAuth | null>;

    findByUserId(userId: number): Promise<OAuth[] | null>;
}
