import { hashBcrypt } from '../../utils/bcrypt.util';
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
    private profileImagePublicId?: string;
    private bannerImage: string;
    private bannerImagePublicId?: string;
    private backgroundImage: string;
    private backgroundImagePublicId?: string;
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
        biography?: string,
        profileImagePublicId?: string,
        bannerImagePublicId?: string,
        backgroundImagePublicId?: string
    ) {
        this.userId = userId;
        this.email = email;
        this.password = password;
        this.username = username;
        this.reputation = reputation;
        this.profileImage = profileImage;
        this.profileImagePublicId = profileImagePublicId;
        this.bannerImage = bannerImage;
        this.bannerImagePublicId = bannerImagePublicId;
        this.backgroundImage = backgroundImage;
        this.backgroundImagePublicId = backgroundImagePublicId;
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
        profileImagePublicId?: string;
        bannerImage: string;
        bannerImagePublicId?: string;
        backgroundImage: string;
        backgroundImagePublicId?: string;
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
            data.biography ?? '',
            data.profileImagePublicId,
            data.bannerImagePublicId,
            data.backgroundImagePublicId
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
        const hashedPassword = await hashBcrypt(input.password);

        return User.fromPersistence({
            userId: 0,
            email: input.email,
            password: hashedPassword,
            username: input.username,
            reputation: 0,
            profileImage: '',
            bannerImage: '',
            backgroundImage: '',
            emailVerified: false,
            createdAt: new Date(),
            biography: input.biography ?? ''
        });
    }

    public static fromOAuth(data: {
        email: string;
        username?: string;
    }): User {
        return User.fromPersistence({
            userId: 0,
            email: data.email,
            password: '',
            username: data.username || data.email.split('@')[0],
            reputation: 0,
            profileImage: '',
            bannerImage: '',
            backgroundImage: '',
            emailVerified: false,
            createdAt: new Date(),
            biography: ''
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

    getProfileImagePublicId(): string | undefined {
        return this.profileImagePublicId;
    }

    getBannerImage(): string {
        return this.bannerImage;
    }

    getBannerImagePublicId(): string | undefined {
        return this.bannerImagePublicId;
    }

    getBackgroundImage(): string {
        return this.backgroundImage;
    }

    getBackgroundImagePublicId(): string | undefined {
        return this.backgroundImagePublicId;
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
