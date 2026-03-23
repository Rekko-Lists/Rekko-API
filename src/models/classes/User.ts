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

    public constructor(
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

    getUserId(): number {
        return this.userId;
    }

    getEmail(): string {
        return this.email;
    }

    getUsername(): string {
        return this.username;
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
