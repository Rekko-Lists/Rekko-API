export class Post {
    private readonly postId: number;
    private readonly userId: number;
    private title: string;
    private description: string;
    private photo: string;
    private likes: number;

    private constructor(
        postId: number,
        userId: number,
        title: string,
        description: string,
        photo: string,
        likes: number
    ) {
        this.postId = postId;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.photo = photo;
        this.likes = likes;
    }

    public static fromPersistence(data: {
        postId: number;
        userId: number;
        title: string;
        description: string;
        photo: string;
        likes: number;
    }): Post {
        return new Post(
            data.postId,
            data.userId,
            data.title,
            data.description,
            data.photo,
            data.likes
        );
    }

    getPostId(): number {
        return this.postId;
    }

    getUserId(): number {
        return this.userId;
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
