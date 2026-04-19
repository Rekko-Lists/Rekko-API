import { hashPassword } from '../../utils/password.util';
import {
    CreateUserInput,
    SocialAccount
} from '../schemas/user.schemas';

export class User {
    private readonly userId: number;
    private email: string;
    private password: string;
    private username: string;
    private reputation: number = 0;
    private profileImage: string;
    private bannerImage: string;
    private backgroundImage: string;
    private role: UserRole = UserRole.USER;
    private emailVerified: boolean = false;
    private readonly createdAt: Date;
    private biography?: string;
    private socialAccounts: SocialAccount[] = [];

    private constructor(
        userId: number,
        email: string,
        password: string,
        username: string,
        reputation: number,
        profileImage: string,
        bannerImage: string,
        backgroundImage: string,
        role: UserRole = UserRole.USER,
        emailVerified: boolean = false,
        createdAt: Date,
        biography?: string
    ) {
        this.userId = userId;
        this.email = email;
        this.password = password;
        this.username = username;
        this.reputation = reputation;
        this.profileImage = profileImage;
        this.bannerImage = bannerImage;
        this.backgroundImage = backgroundImage;
        this.role = role;
        this.emailVerified = emailVerified;
        this.createdAt = createdAt;
        this.biography = biography;
    }

    public static fromPersistence(data: {
        userId: number;
        email: string;
        password: string;
        username: string;
        reputation?: number;
        profileImage: string;
        bannerImage: string;
        backgroundImage: string;
        role?: UserRole;
        emailVerified?: boolean;
        createdAt: Date;
        biography?: string;
        userSocialAccount?: any[];
    }): User {
        const user = new User(
            data.userId,
            data.email,
            data.password,
            data.username,
            data.reputation ?? 0,
            data.profileImage,
            data.bannerImage,
            data.backgroundImage,
            data.role ?? UserRole.USER,
            data.emailVerified ?? false,
            data.createdAt,
            data.biography ?? ''
        );

        if (
            data.userSocialAccount &&
            Array.isArray(data.userSocialAccount)
        ) {
            user.socialAccounts = data.userSocialAccount.map(
                (usa) => ({
                    name: usa.socialAccount.name,
                    url: usa.socialUrl
                })
            );
        }

        return user;
    }

    public static async fromInput(
        input: CreateUserInput
    ): Promise<User> {
        const hashedPassword = await hashPassword(
            input.password
        );

        return User.fromPersistence({
            userId: 0,
            email: input.email,
            password: hashedPassword,
            username: input.username,
            reputation: 0,
            profileImage: input.profileImage ?? '',
            bannerImage: input.bannerImage ?? '',
            backgroundImage: input.backgroundImage ?? '',
            emailVerified: false,
            createdAt: new Date(),
            biography: input.biography ?? ''
        });
    }

    getUserId(): number {
        return this.userId;
    }

    getEmail(): string {
        return this.email;
    }

    getUsername(): string {
        return this.username;
    }

    getReputation(): number {
        return this.reputation;
    }

    getPasswordHash(): string {
        return this.password;
    }

    getProfileImage(): string {
        return this.profileImage;
    }

    getBannerImage(): string {
        return this.bannerImage;
    }

    getBackgroundImage(): string {
        return this.backgroundImage;
    }

    getRole(): string {
        return this.role;
    }

    getEmailVerified(): boolean {
        return this.emailVerified;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getBiography(): string | undefined {
        return this.biography;
    }

    getSocialAccounts(): SocialAccount[] {
        return this.socialAccounts;
    }

    toString(): string {
        return `
            user_id=${this.userId},
            email=${this.email},
            username=${this.username},
            profileImage=${this.profileImage},
            bannerImage=${this.bannerImage},
            backgroundImage=${this.backgroundImage},
            role=${this.role},
            createdAt=${this.createdAt}
        `;
    }
}

export enum UserRole {
    USER = 'USER',
    MODERATOR = 'MODERATOR',
    ADMIN = 'ADMIN'
}
