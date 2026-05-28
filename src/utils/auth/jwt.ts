import jwt, {
    TokenExpiredError as JwtTokenExpiredError
} from 'jsonwebtoken';
import {
    NotFoundError,
    InvalidTokenError,
    TokenExpiredError
} from '../../exceptions/exceptions';
import { UserRole } from '../../domain/schemas/user/user.schemas';
import { JWT_TOKEN_EXPIRY } from '../../constants';

interface TemporaryTokenPayload {
    purpose: string;
    iat?: number;
    exp?: number;
}

export function sign10MinToken(purpose: string): string {
    return jwt.sign(
        { purpose },
        process.env.JWT_SECRET as string,
        { expiresIn: JWT_TOKEN_EXPIRY.TEMPORARY_TOKEN }
    );
}

export function verifyToken(
    token: string,
    expectedPurpose: string
): TemporaryTokenPayload {
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
    ) as TemporaryTokenPayload;

    if (decoded.purpose !== expectedPurpose) {
        throw new NotFoundError('Invalid token purpose');
    }

    return decoded;
}

export function signAccessToken(
    userId: number,
    role: UserRole,
    emailVerified: boolean
): string {
    return jwt.sign(
        { userId, role, emailVerified, type: 'access' },
        process.env.JWT_SECRET as string,
        { expiresIn: JWT_TOKEN_EXPIRY.ACCESS_TOKEN }
    );
}

interface AccessTokenPayload {
    userId: number;
    role: UserRole;
    emailVerified: boolean;
    type: 'access';
    iat?: number;
    exp?: number;
}

export function verifyAccessToken(
    token: string
): AccessTokenPayload {
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as AccessTokenPayload;

        if (decoded.type !== 'access') {
            throw new InvalidTokenError('Invalid token type');
        }

        return decoded;
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
