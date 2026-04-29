import bcrypt from 'bcrypt';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

export async function hashBcrypt(
    content: string
): Promise<string> {
    return bcrypt.hash(content, SALT_ROUNDS);
}

export async function comparePassword(
    plainPassword: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
}
