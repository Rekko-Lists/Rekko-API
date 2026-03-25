export class OAuthAccount {
    private readonly oauthAccountId: number;
    private readonly userId: number;
    private providerUserId: number;
    private provider: string;
    private accessToken: string;

    private constructor(
        oauthAccountId: number,
        userId: number,
        providerUserId: number,
        provider: string,
        accessToken: string
    ) {
        this.oauthAccountId = oauthAccountId;
        this.userId = userId;
        this.providerUserId = providerUserId;
        this.provider = provider;
        this.accessToken = accessToken;
    }

    public static fromPersistence(data: {
        oauthAccountId: number;
        userId: number;
        providerUserId: number;
        provider: string;
        accessToken: string;
    }): OAuthAccount {
        return new OAuthAccount(
            data.oauthAccountId,
            data.userId,
            data.providerUserId,
            data.provider,
            data.accessToken
        );
    }

    getOAuthAccountId(): number {
        return this.oauthAccountId;
    }

    getUserId(): number {
        return this.userId;
    }

    toString(): string {
        return `
            oauthAccountId=${this.oauthAccountId},
            userId=${this.userId},
            providerUserId=${this.providerUserId},
            provider=${this.provider},
            accessToken=${this.accessToken}
        `;
    }
}
