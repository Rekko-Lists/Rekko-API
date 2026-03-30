export class SocialAccount {
    private readonly socialAccountId: number;
    private name: string;

    private constructor(socialAccountId: number, name: string) {
        this.socialAccountId = socialAccountId;
        this.name = name;
    }

    public static fromPersistence(data: {
        socialAccountId: number;
        name: string;
    }) {
        return new SocialAccount(
            data.socialAccountId,
            data.name
        );
    }

    getSocialAccountId(): number {
        return this.socialAccountId;
    }

    getName(): string {
        return this.name;
    }

    toString(): string {
        return `
            socialAccountId=${this.socialAccountId},
            name=${this.name},
        `;
    }
}
