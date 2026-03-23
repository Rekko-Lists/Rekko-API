export class OAuthAccount {
    private readonly oauthAccountId: number;
    private readonly userId: number;
    private providerUserId: number;
    private provider: string;
    private accessToken: string;

    constructor(
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
