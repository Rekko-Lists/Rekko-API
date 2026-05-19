export class Post {
    private readonly postId: number;
    private readonly userId: number;
    private title: string;
    private description: string | null;
    private photo: string | null;
    private likes: number;
    private user?: { username: string; profileImage: string };

    private constructor(
        postId: number,
        userId: number,
        title: string,
        description: string | null,
        photo: string | null,
        likes: number,
        user?: { username: string; profileImage: string }
    ) {
        this.postId = postId;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.photo = photo;
        this.likes = likes;
        this.user = user;
    }

    public static fromPersistence(data: {
        postId: number;
        userId: number;
        title: string;
        description: string | null;
        photo: string | null;
        likes: number;
        user?: { username: string; profileImage: string };
    }): Post {
        return new Post(
            data.postId,
            data.userId,
            data.title,
            data.description,
            data.photo,
            data.likes,
            data.user
        );
    }

    getPostId(): number {
        return this.postId;
    }

    getUserId(): number {
        return this.userId;
    }

    getTitle(): string {
        return this.title;
    }

    getDescription(): string | null {
        return this.description;
    }

    getPhoto(): string | null {
        return this.photo;
    }

    getLikes(): number {
        return this.likes;
    }

    getUser():
        | { username: string; profileImage: string }
        | undefined {
        return this.user;
    }

    toString(): string {
        return `
            postId=${this.postId},
            userId=${this.userId},
            title=${this.title},
            description=${this.description},
            photo=${this.photo},
            likes=${this.likes}
        `;
    }
}
