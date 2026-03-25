export class User {
    private readonly userId: number;
    private email: string;
    private passwordHash: string;
    private username: string;
    private profileImage: string;
    private bannerImage: string;
    private backgroundImage: string;
    private role: UserRole = UserRole.USER;
    private readonly createdAt: Date;

    private constructor(
        userId: number,
        email: string,
        passwordHash: string,
        username: string,
        profileImage: string,
        bannerImage: string,
        backgroundImage: string,
        role: UserRole = UserRole.USER,
        createdAt: Date
    ) {
        this.userId = userId;
        this.email = email;
        this.passwordHash = passwordHash;
        this.username = username;
        this.profileImage = profileImage;
        this.bannerImage = bannerImage;
        this.backgroundImage = backgroundImage;
        this.role = role;
        this.createdAt = createdAt;
    }

    public static fromPersistence(data: {
        userId: number;
        email: string;
        passwordHash: string;
        username: string;
        profileImage: string;
        bannerImage: string;
        backgroundImage: string;
        role?: UserRole;
        createdAt: Date;
    }): User {
        return new User(
            data.userId,
            data.email,
            data.passwordHash,
            data.username,
            data.profileImage,
            data.bannerImage,
            data.backgroundImage,
            data.role ?? UserRole.USER,
            data.createdAt
        );
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

    getPasswordHash(): string {
        return this.passwordHash;
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
