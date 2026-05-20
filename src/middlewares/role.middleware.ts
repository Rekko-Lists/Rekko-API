import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../exceptions/exceptions';
import { UserRole } from '../domain/schemas/user/user.schemas';

export const roleMiddleware =
    (allowedRoles: UserRole[]) =>
    (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            throw new ForbiddenError('User not authenticated');
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ForbiddenError(
                `Access denied. Required roles: ${allowedRoles.join(', ')}`
            );
        }

        next();
    };
