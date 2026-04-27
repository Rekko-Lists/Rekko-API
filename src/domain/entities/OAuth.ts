export class OAuth {
    private readonly oauthId: number;
    private readonly userId: number;
    private providerUserId: string;
    private provider: string;

    private constructor(
        oauthId: number,
        userId: number,
        providerUserId: string,
        provider: string
    ) {
        this.oauthId = oauthId;
        this.userId = userId;
        this.providerUserId = providerUserId;
        this.provider = provider;
    }

    public static fromPersistence(data: {
        oauthId: number;
        userId: number;
        providerUserId: string;
        provider: string;
    }): OAuth {
        return new OAuth(
            data.oauthId,
            data.userId,
            data.providerUserId,
            data.provider
        );
    }

    getOAuthId(): number {
        return this.oauthId;
    }

    getUserId(): number {
        return this.userId;
    }

    getProviderUserId(): string {
        return this.providerUserId;
    }

    getProvider(): string {
        return this.provider;
    }

    toString(): string {
        return `
            oauthId=${this.oauthId},
            userId=${this.userId},
            providerUserId=${this.providerUserId},
            provider=${this.provider}
        `;
    }
}
