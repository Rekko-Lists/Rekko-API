export interface PasswordAuthRepository<User> {
    updatePasswordRequest(
        userId: number,
        token: string
    ): Promise<void>;

    updatePassword(
        userId: number,
        token: string,
        passwordHash: string
    ): Promise<User | null>;
}
