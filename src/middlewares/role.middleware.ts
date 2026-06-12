import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../exceptions/exceptions';
import { UserRole } from '../domain/schemas/user/user.schemas';

export const roleMiddleware =
    (allowedRoles: UserRole[]) =>
    (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                throw new ForbiddenError('User not authenticated');
            }

            // El role viene del JWT firmado (15 min de vida): una democion
            // tarda como mucho la expiracion del token en aplicar.
            if (!allowedRoles.includes(req.user.role)) {
                throw new ForbiddenError(
                    `Access denied. Required roles: ${allowedRoles.join(', ')}`
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
