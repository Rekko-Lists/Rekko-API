export class Comment {
    private readonly commentId: number;
    private readonly userId: number;
    private readonly postId: number;
    private parentCommentId: number | null;
    private message: string;
    private likes: number;
    private user?: { username: string; profileImage: string };
    private hasReplies?: boolean;
    private replyCount?: number;

    private constructor(
        commentId: number,
        userId: number,
        postId: number,
        parentCommentId: number | null,
        message: string,
        likes: number,
        user?: { username: string; profileImage: string },
        hasReplies?: boolean,
        replyCount?: number
    ) {
        this.commentId = commentId;
        this.userId = userId;
        this.postId = postId;
        this.parentCommentId = parentCommentId;
        this.message = message;
        this.likes = likes;
        this.user = user;
        this.hasReplies = hasReplies;
        this.replyCount = replyCount;
    }

    public static fromPersistence(data: {
        commentId: number;
        userId: number;
        postId: number;
        parentCommentId: number | null;
        message: string;
        likes: number;
        user?: { username: string; profileImage: string };
        hasReplies?: boolean;
        replyCount?: number;
    }): Comment {
        return new Comment(
            data.commentId,
            data.userId,
            data.postId,
            data.parentCommentId,
            data.message,
            data.likes,
            data.user,
            data.hasReplies,
            data.replyCount
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

    getMessage(): string {
        return this.message;
    }

    getLikes(): number {
        return this.likes;
    }

    getUser():
        | { username: string; profileImage: string }
        | undefined {
        return this.user;
    }

    getReplyCount(): number | undefined {
        return this.replyCount;
    }

    getHasReplies(): boolean | undefined {
        return this.hasReplies;
    }

    toString(): string {
        return `
            commentId=${this.commentId},
            userId=${this.userId},
            postId=${this.postId},
            parentCommentId=${this.parentCommentId},
            message=${this.message},
            likes=${this.likes},
            user=${this.user ? JSON.stringify(this.user) : 'null'},
            hasReplies=${this.hasReplies},
            replyCount=${this.replyCount}
        `;
    }
}
