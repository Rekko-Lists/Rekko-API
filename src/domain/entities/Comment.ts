export class Comment {
    private readonly commentId: number;
    private readonly userId: number;
    private readonly postId: number;
    private parentCommentId: number | null;
    private message: string;
    private likes: number;

    private constructor(
        commentId: number,
        userId: number,
        postId: number,
        parentCommentId: number | null,
        message: string,
        likes: number
    ) {
        this.commentId = commentId;
        this.userId = userId;
        this.postId = postId;
        this.parentCommentId = parentCommentId;
        this.message = message;
        this.likes = likes;
    }

    public static fromPersistence(data: {
        commentId: number;
        userId: number;
        postId: number;
        parentCommentId: number | null;
        message: string;
        likes: number;
    }): Comment {
        return new Comment(
            data.commentId,
            data.userId,
            data.postId,
            data.parentCommentId,
            data.message,
            data.likes
        );
    }

    getCommentId() {
        return this.commentId;
    }

    getUserId() {
        return this.userId;
    }

    getPostId() {
        return this.postId;
    }

    getParentCommentId() {
        return this.parentCommentId;
    }

    toString(): string {
        return `
            commentId=${this.commentId},
            userId=${this.userId},
            postId=${this.postId},
            parentCommentId=${this.parentCommentId},
            message=${this.message},
            likes=${this.likes}
        `;
    }
}
