export class Post {
    private readonly postId: number;
    private readonly userId: number | null;
    private title: string;
    private description: string | null;
    private photo: string | null;
    private likes: number;
    private user?: { username: string; profileImage: string };
    private animes: Array<{
        malId: number;
        name: string;
        imgMedium: string;
        imgLarge: string;
    }>;

    private constructor(
        postId: number,
        userId: number | null,
        title: string,
        description: string | null,
        photo: string | null,
        likes: number,
        user?: { username: string; profileImage: string },
        animes: Array<{
            malId: number;
            name: string;
            imgMedium: string;
            imgLarge: string;
        }> = []
    ) {
        this.postId = postId;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.photo = photo;
        this.likes = likes;
        this.user = user;
        this.animes = animes;
    }

    public static fromPersistence(data: {
        postId: number;
        userId: number | null;
        title: string;
        description: string | null;
        photo: string | null;
        likes: number;
        user?: { username: string; profileImage: string };
        animes?: Array<{
            anime?: {
                malId: number;
                name: string;
                imgMedium: string;
                imgLarge: string;
            };
        }>;
    }): Post {
        return new Post(
            data.postId,
            data.userId,
            data.title,
            data.description,
            data.photo,
            data.likes,
            data.user,
            data.animes
                ?.map((animePost) => animePost.anime)
                .filter((anime): anime is {
                    malId: number;
                    name: string;
                    imgMedium: string;
                    imgLarge: string;
                } => Boolean(anime)) ?? []
        );
    }

    getPostId(): number {
        return this.postId;
    }

    getUserId(): number | null {
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

    getAnimes(): Array<{
        malId: number;
        name: string;
        imgMedium: string;
        imgLarge: string;
    }> {
        return this.animes;
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
