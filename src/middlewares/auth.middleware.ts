import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { InvalidTokenError } from '../domain/errors/auth.errors';

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
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
        userId: decoded.userId
    };

    next();
};

export const userAuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (req.path === '/' && req.method === 'POST') return next();
    authMiddleware(req, res, next);
};

export const authAuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (
        (req.path === '/login' || req.path === '/refresh') &&
        req.method === 'POST'
    )
        return next();
    authMiddleware(req, res, next);
};
