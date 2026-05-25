import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../exceptions/AuthorizationError';

export const emailVerifyMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        throw new AuthorizationError('User not authenticated');
    }

    if (!req.user.emailVerified) {
        throw new AuthorizationError(
            'Email not verified. Please verify your email to access this resource.'
        );
    }

    next();
};
