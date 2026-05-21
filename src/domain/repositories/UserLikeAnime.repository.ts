export interface UserLikeAnimeRepository {
    exists(userId: number, animeId: number): Promise<boolean>;

    add(userId: number, animeId: number): Promise<void>;

    remove(userId: number, animeId: number): Promise<void>;
}
