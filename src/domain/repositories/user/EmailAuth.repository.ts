export interface EmailAuthRepository<User> {
    findByEmail(email: string): Promise<User | null>;

    verifyEmailRequest(
        userId: number,
        token: string
    ): Promise<void>;

    verifyEmail(userId: number, token: string): Promise<void>;

    updateEmailRequest(
        userId: number,
        newEmail: string,
        token: string
    ): Promise<void>;

    updateEmail(
        userId: number,
        token: string
    ): Promise<User | null>;
}
