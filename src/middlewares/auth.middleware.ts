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
    if (req.method === 'GET') {
        if (
            req.path === '/' ||
            /^\/[^/]+$/.test(req.path) ||
            /^\/[^/]+\/verify-email\/confirm$/.test(req.path) ||
            /^\/[^/]+\/change-email\/confirm$/.test(req.path)
        ) {
            return next();
        }
    }

    if (req.method === 'POST') {
        if (
            req.path === '/' ||
            /^\/[^/]+\/forgot-password$/.test(req.path) ||
            /^\/[^/]+\/reset-password$/.test(req.path)
        ) {
            return next();
        }
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
