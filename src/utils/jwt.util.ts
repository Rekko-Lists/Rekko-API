import jwt from 'jsonwebtoken';
import { NotFoundError } from '../domain/errors/http.errors';
import { InvalidTokenError } from '../domain/errors/auth.errors';

export function sign10MinToken(purpose: string) {
    return jwt.sign(
        { purpose },
        process.env.JWT_SECRET as string,
        { expiresIn: '10m' }
    );
}

export function verifyToken(
    token: string,
    expectedPurpose: string
): void {
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
    ) as any;

    if (decoded.purpose !== expectedPurpose) {
        throw new NotFoundError('Invalid token purpose');
    }
}

export function signAccessToken(userId: number): string {
    return jwt.sign(
        { userId, type: 'access' },
        process.env.JWT_SECRET as string,
        { expiresIn: '15m' }
    );
}

export function signRefreshToken(userId: number): string {
    return jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );
}

export function verifyAccessToken(token: string): {
    userId: number;
    type: string;
} {
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as any;

        if (decoded.type !== 'access') {
            throw new InvalidTokenError('Invalid token type');
        }

        return { userId: decoded.userId, type: 'access' };
    } catch (error) {
        if (error instanceof InvalidTokenError) {
            throw error;
        }
        throw new InvalidTokenError(
            'Invalid or expired access token'
        );
    }
}

export function verifyRefreshToken(token: string): {
    userId: number;
    type: string;
} {
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as any;

        if (decoded.type !== 'refresh') {
            throw new InvalidTokenError('Invalid token type');
        }

        return { userId: decoded.userId, type: 'refresh' };
    } catch (error) {
        if (error instanceof InvalidTokenError) {
            throw error;
        }
        throw new InvalidTokenError(
            'Invalid or expired refresh token'
        );
    }
}
