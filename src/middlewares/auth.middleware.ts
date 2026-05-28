import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth/jwt';
import { UserRole } from '../domain/schemas/user/user.schemas';
import { InvalidTokenError } from '../exceptions/exceptions';
import { PUBLIC_USER_ROUTE_PATTERNS } from '../constants';
import { logger } from '../utils/logger';

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                role: UserRole;
                emailVerified: boolean;
            };
        }
    }
}

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new InvalidTokenError(
            'Authorization header is missing or invalid'
        );
    }

    const token = authHeader.slice(7);

    const decoded = verifyAccessToken(token);

    req.user = {
        userId: decoded.userId,
        role: decoded.role,
        emailVerified: decoded.emailVerified
    };

    next();
};

export const optionalAuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    try {
        const token = authHeader.slice(7);

        const decoded = verifyAccessToken(token);

        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            emailVerified: decoded.emailVerified
        };
    } catch (error) {
        logger.warn('Optional auth token ignored', error);
    }

    next();
};

function isPublicUserRoute(
    method: string,
    path: string
): boolean {
    const patterns =
        PUBLIC_USER_ROUTE_PATTERNS[
            method as keyof typeof PUBLIC_USER_ROUTE_PATTERNS
        ];

    return Boolean(patterns?.some((pattern) => pattern.test(path)));
}

export const userAuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (isPublicUserRoute(req.method, req.path)) {
        return next();
    }

    authMiddleware(req, res, next);
};

export const authAuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const paths = ['/login', '/refresh'];

    if (paths.includes(req.path) && req.method === 'POST')
        return next();
    authMiddleware(req, res, next);
};
