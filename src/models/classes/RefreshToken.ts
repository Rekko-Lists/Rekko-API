export class RefreshToken {
    private readonly refreshTokenId: number;
    private readonly userId: number;
    private token: string;
    private createdAt: Date;
    private expiresAt: Date;
    private revokedAt: Date;
    private userAgent: string;
    private ip: string;

    constructor(
        refreshTokenId: number,
        userId: number,
        token: string,
        createdAt: Date,
        expiresAt: Date,
        revokedAt: Date,
        userAgent: string,
        ip: string
    ) {
        this.refreshTokenId = refreshTokenId;
        this.userId = userId;
        this.token = token;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.revokedAt = revokedAt;
        this.userAgent = userAgent;
        this.ip = ip;
    }

    getRefreshTokenId() {
        return this.refreshTokenId;
    }

    getUserId() {
        return this.userId;
    }

    toString(): string {
        return `
            refreshTokenId=${this.refreshTokenId},
            userId=${this.userId},
            token=${this.token},
            createdAt=${this.createdAt},
            expiresAt=${this.expiresAt},
            revokedAt=${this.revokedAt},
            userAgent=${this.userAgent},
            ip=${this.ip}
        `;
    }
}
