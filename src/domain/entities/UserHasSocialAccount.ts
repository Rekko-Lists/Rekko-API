export class UserHasSocialAccount {
    private readonly userHasSocialAccountId: number;
    private readonly userId: number;
    private readonly socialAccountId: number;
    private socialUrl: string;

    private constructor(
        userHasSocialAccountId: number,
        userId: number,
        socialAccountId: number,
        socialUrl: string
    ) {
        this.userHasSocialAccountId = userHasSocialAccountId;
        this.userId = userId;
        this.socialAccountId = socialAccountId;
        this.socialUrl = socialUrl;
    }

    public static fromPersistence(data: {
        userHasSocialAccountId: number;
        userId: number;
        socialAccountId: number;
        socialUrl: string;
    }) {
        return new UserHasSocialAccount(
            data.userHasSocialAccountId,
            data.userId,
            data.socialAccountId,
            data.socialUrl
        );
    }

    getUserHasSocialAccountId(): number {
        return this.userHasSocialAccountId;
    }

    getUserId(): number {
        return this.userId;
    }

    getSocialAccountId(): number {
        return this.socialAccountId;
    }

    getSocialUrl(): string {
        return this.socialUrl;
    }

    toString(): string {
        return `
            userHasSocialAccountId=${this.userHasSocialAccountId},
            socialAccountId=${this.socialAccountId},
            userId=${this.userId},
            socialUrl=${this.socialUrl}
        `;
    }
}
