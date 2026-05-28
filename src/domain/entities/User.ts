import { hashBcrypt } from '../../utils/auth/bcrypt.util';
import {
    CreateUserInput,
    SocialAccount,
    UserConstructorData
} from '../schemas/user/user.schemas';

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

    private constructor(data: UserConstructorData) {
        this.userId = data.userId;
        this.email = data.email;
        this.password = data.password;
        this.username = data.username;
        this.reputation = data.reputation;
        this.profileImage = data.profileImage;
        this.profileImagePublicId = data.profileImagePublicId;
        this.bannerImage = data.bannerImage;
        this.bannerImagePublicId = data.bannerImagePublicId;
        this.backgroundImage = data.backgroundImage;
        this.backgroundImagePublicId =
            data.backgroundImagePublicId;
        this.role = UserRole[data.role as keyof typeof UserRole];
        this.emailVerified = data.emailVerified;
        this.createdAt = data.createdAt;
        this.biography = data.biography;
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
        const constructorData: UserConstructorData = {
            userId: data.userId,
            email: data.email,
            password: data.password,
            username: data.username,
            reputation: data.reputation ?? 0,
            profileImage: data.profileImage,
            bannerImage: data.bannerImage,
            backgroundImage: data.backgroundImage,
            role: data.role ?? UserRole.USER,
            emailVerified: data.emailVerified ?? false,
            createdAt: data.createdAt,
            biography: data.biography ?? '',
            profileImagePublicId: data.profileImagePublicId,
            bannerImagePublicId: data.bannerImagePublicId,
            backgroundImagePublicId: data.backgroundImagePublicId
        };

        const user = new User(constructorData);

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
