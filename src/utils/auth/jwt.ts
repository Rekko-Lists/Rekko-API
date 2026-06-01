import jwt, {
    TokenExpiredError as JwtTokenExpiredError
} from 'jsonwebtoken';
import {
    InvalidTokenError,
    TokenExpiredError
} from '../../exceptions/exceptions';
import { UserRole } from '../../domain/schemas/user/user.schemas';

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
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as any;

        if (decoded.purpose !== expectedPurpose) {
            throw new InvalidTokenError('Invalid token purpose');
        }
    } catch (error) {
        if (error instanceof InvalidTokenError) {
            throw error;
        }
        if (error instanceof JwtTokenExpiredError) {
            throw new TokenExpiredError();
        }
        throw new InvalidTokenError('Invalid token');
    }
}

export function signAccessToken(
    userId: number,
    role: UserRole,
    emailVerified: boolean
): string {
    return jwt.sign(
        { userId, role, emailVerified, type: 'access' },
        process.env.JWT_SECRET as string,
        { expiresIn: '15m' }
    );
}

export function verifyAccessToken(token: string): {
    userId: number;
    role: UserRole;
    emailVerified: boolean;
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

        return {
            userId: decoded.userId,
            role: decoded.role,
            emailVerified: decoded.emailVerified,
            type: 'access'
        };
    } catch (error) {
        if (error instanceof InvalidTokenError) {
            throw error;
        }
        if (error instanceof JwtTokenExpiredError) {
            throw new TokenExpiredError();
        }
        throw new InvalidTokenError(
            'Invalid or expired access token'
        );
    }
}
